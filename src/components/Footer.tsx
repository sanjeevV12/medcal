import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.jpeg" alt="mASSI Logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-bold">mASSI</span>
            </div>
            <p className="text-background/70 mb-6">
              Emergency medical assistance within 12 minutes. Because every second counts in saving lives.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-background/70 hover:text-background transition-colors">How it Works</a></li>
              <li><a href="#services" className="text-background/70 hover:text-background transition-colors">Services</a></li>
              <li><a href="#coverage" className="text-background/70 hover:text-background transition-colors">Coverage Areas</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Partner Hospitals</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emergency/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emergency" />
                </div>
                <div>
                  <p className="text-sm text-background/70">Emergency</p>
                  <a href="tel:+917479898265" className="font-semibold hover:text-emergency transition-colors">
                    +91-7479898265
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-background/70">Email</p>
                  <p className="font-semibold">help@massi.in</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-background/70">Address</p>
                  <p className="font-semibold">Bangalore, India</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Prime Membership */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Be a Prime Member</h3>
            <div className="bg-primary/20 rounded-2xl p-5 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-warning" />
                <span className="font-bold text-lg">mASSI Prime</span>
              </div>
              <div className="mb-3">
                <span className="text-3xl font-bold text-primary">₹249</span>
                <span className="text-background/70 text-sm">/person/month</span>
              </div>
              <ul className="space-y-2 text-sm text-background/80 mb-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Priority ambulance dispatch
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Free doctor consultations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  10% off all services
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  24/7 dedicated support
                </li>
              </ul>
              <Button variant="default" size="sm" className="w-full">
                Join Prime
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2024 mASSI. All rights reserved. Saving lives, one minute at a time.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/50 hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/50 hover:text-background transition-colors">Terms of Service</a>
            <a href="#" className="text-background/50 hover:text-background transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
