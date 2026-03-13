import { useState } from "react";
import { CreditCard, Smartphone, Banknote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface RidePaymentProps {
  fare: number;
  distance: number;
  hospitalName: string;
  driverName: string;
  onComplete: () => void;
}

const RidePayment = ({ fare, distance, hospitalName, driverName, onComplete }: RidePaymentProps) => {
  const [method, setMethod] = useState<'upi' | 'cash' | 'card'>('upi');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    // Simulate payment
    await new Promise(r => setTimeout(r, 2000));
    setPaid(true);
    setPaying(false);
    toast({
      title: "✅ Payment Successful",
      description: `₹${fare} paid via ${method.toUpperCase()}`,
    });
  };

  if (paid) {
    return (
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-30 flex items-center justify-center p-6">
        <div className="bg-card rounded-3xl p-8 w-full max-w-sm text-center shadow-card">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Ride Complete!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You've arrived safely at {hospitalName}
          </p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fare</span>
              <span className="font-semibold text-foreground">₹{fare}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="text-foreground">{distance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Driver</span>
              <span className="text-foreground">{driverName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-success font-medium">{method.toUpperCase()} ✓</span>
            </div>
          </div>
          <Button className="w-full h-12 rounded-xl font-semibold" onClick={onComplete}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-30 flex items-end justify-center">
      <div className="bg-card rounded-t-3xl p-6 w-full shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.2)] animate-fade-in">
        <h2 className="text-lg font-bold text-foreground mb-1">Payment</h2>
        <p className="text-sm text-muted-foreground mb-5">Ride to {hospitalName} completed</p>

        {/* Fare breakdown */}
        <div className="bg-muted/50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base fare</span>
            <span className="text-foreground">₹49</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Distance ({distance.toFixed(1)} km × ₹15/km)</span>
            <span className="text-foreground">₹{Math.round(distance * 15)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg text-foreground">₹{fare}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="space-y-2 mb-5">
          {[
            { key: 'upi' as const, icon: Smartphone, label: 'UPI', desc: 'Google Pay, PhonePe' },
            { key: 'card' as const, icon: CreditCard, label: 'Card', desc: 'Debit / Credit' },
            { key: 'cash' as const, icon: Banknote, label: 'Cash', desc: 'Pay driver directly' },
          ].map(({ key, icon: Icon, label, desc }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                method === key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                method === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                method === key ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              } flex items-center justify-center`}>
                {method === key && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>

        <Button 
          className="w-full h-12 rounded-xl font-bold text-base"
          disabled={paying}
          onClick={handlePay}
        >
          {paying ? 'Processing...' : `Pay ₹${fare}`}
        </Button>
      </div>
    </div>
  );
};

export default RidePayment;
