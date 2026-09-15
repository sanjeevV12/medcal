import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";
import { clearWhatsAppCache } from "@/lib/whatsapp";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [rowId, setRowId] = useState<string | null>(null);
  const [bookingNumber, setBookingNumber] = useState("");
  const [driverNumber, setDriverNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("notification_settings")
        .select("id, booking_whatsapp, driver_whatsapp")
        .limit(1)
        .maybeSingle();
      if (data) {
        setRowId(data.id);
        setBookingNumber(data.booking_whatsapp);
        setDriverNumber(data.driver_whatsapp);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    const clean = (v: string) => v.replace(/[^0-9]/g, "");
    const booking = clean(bookingNumber);
    const driver = clean(driverNumber);
    if (booking.length < 10 || driver.length < 10) {
      toast({
        title: "Check the numbers",
        description: "Enter full numbers with country code, e.g. 917479898265",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload = { booking_whatsapp: booking, driver_whatsapp: driver, updated_at: new Date().toISOString() };
    const { data, error } = rowId
      ? await supabase.from("notification_settings").update(payload).eq("id", rowId).select("id").maybeSingle()
      : await supabase.from("notification_settings").insert(payload).select("id").maybeSingle();
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.id) setRowId(data.id);
    setBookingNumber(booking);
    setDriverNumber(driver);
    clearWhatsAppCache();
    toast({ title: "Saved", description: "New bookings and registrations will go to these numbers." });
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Admin access only</h1>
          <p className="text-muted-foreground">This page is restricted to the mASSI admin account.</p>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin settings</h1>
            <p className="text-sm text-muted-foreground">Choose where alerts are sent on WhatsApp.</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="booking-number">Bookings WhatsApp number</Label>
            <Input
              id="booking-number"
              inputMode="numeric"
              placeholder="917479898265"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Every ambulance and basic care booking opens on WhatsApp to this number.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-number">Driver registrations WhatsApp number</Label>
            <Input
              id="driver-number"
              inputMode="numeric"
              placeholder="917479898265"
              value={driverNumber}
              onChange={(e) => setDriverNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              New driver sign-ups are sent to this number.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="w-4 h-4 text-primary" />
            Include the country code without the plus sign — for India start with 91.
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save numbers
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Admin;
