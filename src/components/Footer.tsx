import { Phone, Mail, MapPin, Ambulance, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Ambulance className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Medcal</span>
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
                  <p className="font-semibold">108 / 1800-XXX-XXXX</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-background/70">Email</p>
                  <p className="font-semibold">help@medcal.in</p>
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

          {/* Emergency CTA */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Need Help Now?</h3>
            <p className="text-background/70 mb-6">
              In case of emergency, don't wait. Press the button below or call our emergency hotline.
            </p>
            <Button variant="emergency" size="lg" className="w-full">
              <Phone className="w-5 h-5" />
              Emergency SOS
            </Button>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2024 Medcal. All rights reserved. Saving lives, one minute at a time.
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
