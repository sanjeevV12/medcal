import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, CreditCard, Smartphone, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/hooks/useNotifications";
import { sendTelegramNotification } from "@/lib/telegram";

interface BookingDialogProps {
  children: React.ReactNode;
  serviceType: string;
  title: string;
}

type PaymentMethod = 'upi' | 'netbanking' | 'card' | 'cod';

const BookingDialog = ({ children, serviceType, title }: BookingDialogProps) => {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    notes: '',
    upiId: '',
    bank: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.address) {
        toast({
          title: "Missing Information",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate payment details
      if (paymentMethod === 'upi' && !formData.upiId) {
        toast({ title: "Enter UPI ID", variant: "destructive" });
        return;
      }
      if (paymentMethod === 'netbanking' && !formData.bank) {
        toast({ title: "Select Bank", variant: "destructive" });
        return;
      }
      if (paymentMethod === 'card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv)) {
        toast({ title: "Fill card details", variant: "destructive" });
        return;
      }
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    const bookingId = 'MED' + Date.now().toString().slice(-8);
    
    // Save booking to database if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('booking_records').insert({
        user_id: user.id,
        service_type: serviceType,
        booking_date: formData.date || new Date().toISOString().split('T')[0],
        booking_time: formData.time || null,
        status: 'pending',
        payment_method: paymentMethod,
        amount: getServicePrice(),
        address: formData.address,
        notes: formData.notes || null
      });
    }

    // Send Telegram notification to admin
    const telegramMsg = `📋 <b>New Service Booking!</b>\n\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n📍 Address: ${formData.address}\n🩺 Service: ${serviceType}\n💰 Amount: ${getServicePrice()}\n💳 Payment: ${paymentMethod}\n📅 Date: ${formData.date || 'ASAP'}\n🕐 Time: ${formData.time || 'Any'}\n🆔 Booking ID: ${bookingId}${formData.notes ? `\n📝 Notes: ${formData.notes}` : ''}`;
    sendTelegramNotification(telegramMsg);

    // Forward the same booking details to the admin WhatsApp
    openWhatsApp(telegramMsg);

    // Send booking confirmation SMS
    await sendNotification({
      type: 'booking_confirmation',
      phone: formData.phone,
      name: formData.name,
      serviceType: serviceType,
      bookingId: bookingId
    });

    // Send payment receipt if paid online
    if (paymentMethod !== 'cod') {
      await sendNotification({
        type: 'payment_receipt',
        phone: formData.phone,
        name: formData.name,
        serviceType: serviceType,
        amount: getServicePrice()
      });
    }
    
    toast({
      title: "Booking Confirmed! ✅",
      description: `Your ${serviceType} has been booked. We'll contact you at ${formData.phone}`,
    });
    setIsOpen(false);
    setStep(1);
    setFormData({
      name: '', phone: '', address: '', date: '', time: '', notes: '',
      upiId: '', bank: '', cardNumber: '', cardExpiry: '', cardCvv: ''
    });
  };

  const getServicePrice = () => {
    switch (serviceType) {
      case 'consultation': return 'FREE';
      case 'medicine': return '₹99 Delivery';
      case 'assistance': return '₹499/day';
      case 'monitoring': return '₹299/visit';
      case 'emergency': return '₹3,897';
      case 'insurance': return '₹1,989/month';
      default: return 'Contact for price';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 3 ? <CheckCircle className="w-5 h-5 text-accent" /> : null}
            {title} - Step {step}/3
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 p-3 rounded-lg text-sm">
              <span className="font-semibold">Service:</span> {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
              <span className="float-right font-bold text-primary">{getServicePrice()}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number *
              </Label>
              <Input
                id="phone"
                placeholder="+91 XXXXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address *
              </Label>
              <Textarea
                id="address"
                placeholder="Enter complete address with landmark"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Preferred Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Preferred Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-2xl font-bold text-foreground">{getServicePrice()}</p>
            </div>

            <p className="font-medium text-foreground">Select Payment Method</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'upi' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground text-sm">UPI</p>
                <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
              </button>

              <button
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'netbanking' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground text-sm">Net Banking</p>
                <p className="text-xs text-muted-foreground">All major banks</p>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground text-sm">Card</p>
                <p className="text-xs text-muted-foreground">Credit/Debit</p>
              </button>

              <button
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <span className="text-2xl block mx-auto mb-2">💵</span>
                <p className="font-medium text-foreground text-sm">Pay Later</p>
                <p className="text-xs text-muted-foreground">EMI Available</p>
              </button>
            </div>

            {paymentMethod === 'upi' && (
              <div className="space-y-2">
                <Label htmlFor="upiId">Enter UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <Select onValueChange={(value) => handleInputChange('bank', value)}>
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
                    <SelectItem value="bob">Bank of Baroda</SelectItem>
                    <SelectItem value="other">Other Banks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      type="password"
                      placeholder="***"
                      maxLength={4}
                      value={formData.cardCvv}
                      onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  ✨ <strong>EMI Available!</strong> Pay in easy installments.
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• <strong>6% interest</strong> for 1st month</li>
                  <li>• <strong>12% interest</strong> from 2nd month onwards</li>
                  <li>• Available for 3, 6, or 12 month tenures</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Our executive will explain payment options during visit.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {paymentMethod === 'cod' ? 'Confirm Booking' : 'Pay Now'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your {serviceType} booking is confirmed. We will contact you shortly at <strong>{formData.phone}</strong>
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-xl text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground">{serviceType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-foreground">Bhopal, MP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-medium text-accent">{paymentMethod === 'cod' ? 'Pay Later (EMI)' : 'Paid'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium text-foreground">MED{Date.now().toString().slice(-8)}</span>
              </div>
              {['medicine', 'assistance', 'monitoring'].includes(serviceType) && (
                <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                  <span className="text-muted-foreground">GPS Tracking:</span>
                  <span className="font-medium text-accent flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    Enabled
                  </span>
                </div>
              )}
            </div>
            <Button onClick={handleConfirm} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
