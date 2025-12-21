import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, MessageSquare, Clock, Route, Store, CreditCard, Smartphone, Building2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface Coordinates {
  x: number;
  y: number;
}

interface TrackingState {
  status: 'idle' | 'requesting' | 'responder_assigned' | 'en_route' | 'arriving' | 'arrived';
  progress: number;
  eta: number;
  distance: number;
}

const routePoints: Coordinates[] = [
  { x: 60, y: 45 },  // Start (nearby medical shop)
  { x: 50, y: 48 },
  { x: 40, y: 52 },
  { x: 30, y: 56 },
  { x: 20, y: 60 },  // End (patient location)
];

const patientLocation = { x: 20, y: 60 };
const shopLocation = { x: 60, y: 45 };

type PaymentMethod = 'upi' | 'netbanking' | 'card' | 'cod';

interface BasicCareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BasicCareDialog = ({ open, onOpenChange }: BasicCareDialogProps) => {
  const [tracking, setTracking] = useState<TrackingState>({
    status: 'idle',
    progress: 0,
    eta: 8,
    distance: 1.2
  });
  const [responderPos, setResponderPos] = useState<Coordinates>(routePoints[0]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    bank: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const interpolatePosition = useCallback((start: Coordinates, end: Coordinates, t: number): Coordinates => {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    };
  }, []);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTracking({ status: 'idle', progress: 0, eta: 8, distance: 1.2 });
      setResponderPos(routePoints[0]);
      setCurrentPointIndex(0);
      setShowPulse(false);
      setShowPayment(false);
      setPaymentComplete(false);
      setPaymentMethod('upi');
      setPaymentDetails({ upiId: '', bank: '', cardNumber: '', cardExpiry: '', cardCvv: '' });
    }
  }, [open]);

  // Auto-start when dialog opens
  useEffect(() => {
    if (open && tracking.status === 'idle') {
      handleCareRequest();
    }
  }, [open]);

  useEffect(() => {
    if (tracking.status === 'en_route' || tracking.status === 'arriving') {
      const interval = setInterval(() => {
        setTracking(prev => {
          const newProgress = Math.min(prev.progress + 3, 100);
          const newEta = Math.max(0, Math.round(8 * (1 - newProgress / 100)));
          const newDistance = Math.max(0, Number((1.2 * (1 - newProgress / 100)).toFixed(1)));
          
          let newStatus = prev.status;
          if (newProgress >= 85 && prev.status === 'en_route') {
            newStatus = 'arriving';
            toast({
              title: "🏪 Responder Arriving!",
              description: "Medical responder is almost at your location",
            });
          }
          if (newProgress >= 100) {
            newStatus = 'arrived';
            toast({
              title: "✅ Help Arrived!",
              description: "Medical responder is at your location with supplies",
            });
          }
          
          return {
            ...prev,
            progress: newProgress,
            eta: newEta,
            distance: Number(newDistance),
            status: newStatus
          };
        });

        setCurrentPointIndex(prev => {
          const newIndex = Math.min(
            Math.floor((tracking.progress / 100) * (routePoints.length - 1)),
            routePoints.length - 2
          );
          return newIndex;
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [tracking.status, tracking.progress]);

  // Smooth responder movement
  useEffect(() => {
    if (tracking.status === 'en_route' || tracking.status === 'arriving') {
      const segmentProgress = (tracking.progress / 100) * (routePoints.length - 1);
      const segmentIndex = Math.floor(segmentProgress);
      const t = segmentProgress - segmentIndex;
      
      if (segmentIndex < routePoints.length - 1) {
        const pos = interpolatePosition(
          routePoints[segmentIndex],
          routePoints[segmentIndex + 1],
          t
        );
        setResponderPos(pos);
      } else {
        setResponderPos(routePoints[routePoints.length - 1]);
      }
    }
  }, [tracking.progress, tracking.status, interpolatePosition]);

  const handleCareRequest = () => {
    setTracking({ status: 'requesting', progress: 0, eta: 8, distance: 1.2 });
    setShowPulse(true);
    setResponderPos(routePoints[0]);
    
    toast({
      title: "📍 Location Detected",
      description: "Finding nearest medical shop responder...",
    });

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'responder_assigned' }));
      toast({
        title: "🏪 Responder Assigned!",
        description: "Amit from MedPlus is on the way",
      });
    }, 1500);

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'en_route' }));
    }, 3000);
  };

  const handlePayment = async () => {
    // Validate payment details
    if (paymentMethod === 'upi' && !paymentDetails.upiId) {
      toast({ title: "Enter UPI ID", variant: "destructive" });
      return;
    }
    if (paymentMethod === 'netbanking' && !paymentDetails.bank) {
      toast({ title: "Select Bank", variant: "destructive" });
      return;
    }
    if (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv)) {
      toast({ title: "Fill card details", variant: "destructive" });
      return;
    }

    // Simulate payment processing
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your payment",
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save booking to database if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('booking_records').insert({
        user_id: user.id,
        service_type: 'basic_care',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: new Date().toLocaleTimeString(),
        status: 'completed',
        payment_method: paymentMethod,
        amount: '₹499',
        address: 'Current Location - Bhopal',
        notes: 'Basic Care Service'
      });
    }

    setPaymentComplete(true);
    toast({
      title: "Payment Successful! ✅",
      description: "Thank you for using our Basic Care service",
    });
  };

  const statusColors = {
    idle: 'bg-muted-foreground',
    requesting: 'bg-amber-500',
    responder_assigned: 'bg-blue-500',
    en_route: 'bg-primary',
    arriving: 'bg-accent',
    arrived: 'bg-accent'
  };

  const statusText = {
    idle: 'Ready to assist',
    requesting: 'Finding responder...',
    responder_assigned: 'Responder assigned',
    en_route: 'On the way',
    arriving: 'Almost there!',
    arrived: 'Arrived at location'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Store className="w-5 h-5 text-primary" />
            Basic Care - Live Tracking
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl p-3 border">
              {/* Map Container */}
              <div className="relative h-[300px] bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-900/30 rounded-xl overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-30">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="care-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#care-grid)" />
                  </svg>
                </div>

                {/* Road network */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Main roads */}
                  <path d="M 0 50 L 100 50" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  <path d="M 40 0 L 40 100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  
                  {/* Route path */}
                  {tracking.status !== 'idle' && (
                    <path 
                      d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Traveled path */}
                  {tracking.progress > 0 && (
                    <path 
                      d={`M ${routePoints.slice(0, currentPointIndex + 2).map(p => `${p.x} ${p.y}`).join(' L ')}`}
                      stroke="hsl(var(--accent))"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Medical Shop marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${shopLocation.x}%`, top: `${shopLocation.y}%` }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                      <Store className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap bg-card/90 px-2 py-0.5 rounded">
                      MedPlus
                    </span>
                  </div>
                </div>

                {/* Patient location marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${patientLocation.x}%`, top: `${patientLocation.y}%` }}
                >
                  <div className="relative">
                    {showPulse && (
                      <>
                        <div className="absolute -inset-4 bg-primary/30 rounded-full animate-ping" />
                        <div className="absolute -inset-2 bg-primary/20 rounded-full animate-pulse" />
                      </>
                    )}
                    <div className="w-10 h-10 bg-emergency rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <MapPin className="w-5 h-5 text-emergency-foreground" />
                    </div>
                    <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap bg-card/90 px-2 py-0.5 rounded">
                      Your Location
                    </span>
                  </div>
                </div>

                {/* Responder marker */}
                {tracking.status !== 'idle' && tracking.status !== 'requesting' && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
                    style={{ left: `${responderPos.x}%`, top: `${responderPos.y}%` }}
                  >
                    <div className="relative">
                      <div className={`w-11 h-11 bg-card rounded-xl flex items-center justify-center shadow-xl border-2 ${tracking.status === 'arrived' ? 'border-accent' : 'border-primary'}`}>
                        <span className="text-xl">🏍️</span>
                      </div>
                      {tracking.status !== 'arrived' && (
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-card px-2 py-1 rounded-lg shadow-md text-xs font-medium whitespace-nowrap">
                          <span className="text-primary">{tracking.eta} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="mt-3 p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[tracking.status]} ${tracking.status === 'en_route' || tracking.status === 'arriving' ? 'animate-pulse' : ''}`} />
                    <span className="font-medium text-foreground text-sm">{statusText[tracking.status]}</span>
                  </div>
                  {tracking.status !== 'idle' && tracking.status !== 'arrived' && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{tracking.eta} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Route className="w-4 h-4" />
                        <span>{tracking.distance} km</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                {tracking.status !== 'idle' && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                      style={{ width: `${tracking.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Responder Info Card */}
            {(tracking.status === 'responder_assigned' || tracking.status === 'en_route' || tracking.status === 'arriving' || tracking.status === 'arrived') && (
              <div className="bg-card rounded-xl p-4 border animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    👨‍💼
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">Amit Sharma</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500">★ 4.8</span>
                      <span className="text-muted-foreground">• MedPlus</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium text-foreground">Bike Delivery</span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Carrying</span>
                    <span className="font-medium text-foreground">First Aid Kit</span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Certified</span>
                    <span className="font-medium text-accent">First Aid Trained</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="tel:+917479898265">
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </div>
            )}

            {/* Service Details */}
            <div className="bg-card rounded-xl p-4 border">
              <h4 className="font-bold text-foreground mb-3">Basic Care Includes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  First aid treatment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Wound dressing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Basic medication
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Pain relief
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Cost</span>
                  <span className="text-xl font-bold text-primary">₹499</span>
                </div>
              </div>
            </div>

            {tracking.status === 'arrived' && !showPayment && !paymentComplete && (
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => setShowPayment(true)}
              >
                Proceed to Payment - ₹499
              </Button>
            )}

            {/* Payment Section */}
            {showPayment && !paymentComplete && (
              <div className="bg-card rounded-xl p-4 border animate-fade-in space-y-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold text-primary">₹499</p>
                </div>

                <p className="font-medium text-foreground text-sm">Select Payment Method</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="font-medium text-foreground text-xs">UPI</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'netbanking' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="font-medium text-foreground text-xs">Net Banking</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="font-medium text-foreground text-xs">Card</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <span className="text-lg block mx-auto mb-1">💵</span>
                    <p className="font-medium text-foreground text-xs">Pay Later</p>
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="space-y-2">
                    <Label htmlFor="upiId" className="text-sm">Enter UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                    />
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Select Bank</Label>
                    <Select onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, bank: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sbi">State Bank of India</SelectItem>
                        <SelectItem value="hdfc">HDFC Bank</SelectItem>
                        <SelectItem value="icici">ICICI Bank</SelectItem>
                        <SelectItem value="axis">Axis Bank</SelectItem>
                        <SelectItem value="pnb">Punjab National Bank</SelectItem>
                        <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="cardExpiry" className="text-sm">Expiry</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardExpiry: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cardCvv" className="text-sm">CVV</Label>
                        <Input
                          id="cardCvv"
                          type="password"
                          placeholder="***"
                          maxLength={4}
                          value={paymentDetails.cardCvv}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardCvv: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-accent/10 p-3 rounded-lg text-xs">
                    <p className="text-foreground">
                      <strong>Pay Later:</strong> Cash payment to responder
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPayment(false)} className="flex-1" size="sm">
                    Back
                  </Button>
                  <Button onClick={handlePayment} className="flex-1" size="sm">
                    {paymentMethod === 'cod' ? 'Confirm' : 'Pay ₹499'}
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Complete */}
            {paymentComplete && (
              <div className="bg-card rounded-xl p-4 border animate-fade-in text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Payment Complete!</h4>
                  <p className="text-sm text-muted-foreground">Thank you for using Basic Care</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg text-left space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">₹499</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium text-accent">{paymentMethod === 'cod' ? 'Cash' : 'Paid'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-medium text-foreground">MED{Date.now().toString().slice(-8)}</span>
                  </div>
                </div>
                <Button onClick={() => onOpenChange(false)} className="w-full" size="sm">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BasicCareDialog;
