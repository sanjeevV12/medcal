import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Truck, Phone, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const vehicleOptions = [
  { value: "medi-bike", label: "Medi-Bike" },
  { value: "medi-auto", label: "Medi-Auto" },
  { value: "mayuri", label: "Mayuri Van" },
  { value: "bls", label: "BLS Ambulance" },
  { value: "als", label: "ALS Ambulance" },
  { value: "air", label: "Air Ambulance" },
];

const DriverRegistration = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp_number: "",
    vehicle_type: "bls",
    vehicle_number: "",
    license_number: "",
    experience_years: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.phone || !form.whatsapp_number || !form.vehicle_number || !form.license_number) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("drivers" as any).insert({
        full_name: form.full_name,
        phone: form.phone,
        whatsapp_number: form.whatsapp_number,
        vehicle_type: form.vehicle_type,
        vehicle_number: form.vehicle_number,
        license_number: form.license_number,
        experience_years: parseInt(form.experience_years) || 0,
      } as any);

      if (error) throw error;

      // Send WhatsApp confirmation to admin
      const adminMsg = `🚑 New Driver Registered!\n\nName: ${form.full_name}\nPhone: ${form.phone}\nWhatsApp: ${form.whatsapp_number}\nVehicle: ${form.vehicle_type}\nVehicle No: ${form.vehicle_number}\nLicense: ${form.license_number}`;
      const adminWhatsAppUrl = `https://wa.me/917479898265?text=${encodeURIComponent(adminMsg)}`;
      window.open(adminWhatsAppUrl, "_blank");

      setSubmitted(true);
      toast({ title: "✅ Registration Successful!", description: "You are now registered as a driver partner." });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="driver-registration" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Registration Complete!</h2>
          <p className="text-muted-foreground">You'll receive ride requests on your WhatsApp. Stay available!</p>
          <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ full_name: "", phone: "", whatsapp_number: "", vehicle_type: "bls", vehicle_number: "", license_number: "", experience_years: "" }); }}>
            Register Another Driver
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="driver-registration" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Truck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Join Our Fleet</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Register as a Driver Partner
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join mASSI's network of emergency responders. Get ride requests directly on WhatsApp.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Full Name *
              </label>
              <Input placeholder="Your full name" value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone Number *
              </label>
              <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">WhatsApp Number *</label>
            <Input placeholder="+91 XXXXX XXXXX (for receiving ride alerts)" value={form.whatsapp_number} onChange={(e) => handleChange("whatsapp_number", e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Type *</label>
              <Select value={form.vehicle_type} onValueChange={(v) => handleChange("vehicle_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vehicleOptions.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Vehicle Number *
              </label>
              <Input placeholder="MP-09-AB-1234" value={form.vehicle_number} onChange={(e) => handleChange("vehicle_number", e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Driving License No. *</label>
              <Input placeholder="DL-XXXXXXXXX" value={form.license_number} onChange={(e) => handleChange("license_number", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Experience (years)</label>
              <Input type="number" placeholder="0" value={form.experience_years} onChange={(e) => handleChange("experience_years", e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register as Driver Partner"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DriverRegistration;
