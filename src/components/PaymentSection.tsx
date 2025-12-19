import { CreditCard, Banknote, Shield, Calendar, CheckCircle, Heart, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingDialog from "./BookingDialog";

const paymentMethods = [
  {
    icon: Smartphone,
    title: "UPI Payment",
    description: "GPay, PhonePe, Paytm accepted"
  },
  {
    icon: CreditCard,
    title: "Card Payment",
    description: "Credit/Debit cards accepted"
  },
  {
    icon: Building2,
    title: "Net Banking",
    description: "All major banks supported"
  },
  {
    icon: Calendar,
    title: "EMI Available",
    description: "6% interest (1 month), 12% thereafter"
  }
];

const PaymentSection = () => {
  return (
    <section id="payment" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-medium text-sm mb-4">
            <Heart className="w-4 h-4" />
            Money Should Never Be A Barrier To Health
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Flexible Payment Options
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe everyone deserves quality healthcare. That's why we offer multiple payment options including EMI at 6% interest for the first month, 12% thereafter.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <method.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{method.title}</h4>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Health Insurance Plan */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                    <Shield className="w-4 h-4" />
                    Medcal Health Shield
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Comprehensive Health Insurance
                  </h3>
                  <p className="text-primary-foreground/80 mb-6">
                    Get complete coverage for emergency care, hospitalization, medicines, and more. Peace of mind for you and your family.
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {[
                      "Unlimited emergency ambulance coverage",
                      "Cashless treatment at 500+ hospitals",
                      "Free doctor consultations",
                      "Medicine delivery at doorstep",
                      "Medical assistance (nurse, helper)",
                      "No waiting period for accidents"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center min-w-[240px]">
                  <p className="text-sm text-primary-foreground/80 mb-2">Starting at just</p>
                  <div className="text-4xl font-bold mb-1">₹1,989</div>
                  <p className="text-sm text-primary-foreground/80 mb-4">per month / family</p>
                  
                  <BookingDialog serviceType="insurance" title="Get Health Insurance">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full bg-white text-primary hover:bg-white/90"
                    >
                      Get Insured Today
                    </Button>
                  </BookingDialog>
                  
                  <p className="text-xs text-primary-foreground/60 mt-3">
                    Cancel anytime • No hidden charges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EMI Calculator Preview */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Easy EMI Options
            </h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { months: 3, amount: "₹1,358", interest: "₹61" },
                { months: 6, amount: "₹712", interest: "₹175" },
                { months: 12, amount: "₹382", interest: "₹487" }
              ].map((emi, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">{emi.months} Months</div>
                  <div className="text-lg font-bold text-foreground">{emi.amount}</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                  <div className="text-xs text-primary mt-1">+{emi.interest} interest</div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              *Based on ₹3,897 treatment cost. 6% interest for 1st month, 12% thereafter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
