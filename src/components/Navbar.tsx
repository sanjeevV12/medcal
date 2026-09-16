import { Phone, Menu, X, User, LogOut, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="mASSI Logo" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-bold text-foreground">mASSI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <Link to="/hospitals" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              Hospitals
            </Link>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="#driver-registration" className="text-muted-foreground hover:text-foreground transition-colors">
              Drive with Us
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="tel:+917479898265">
                <Phone className="w-4 h-4 mr-2" />
                +91-7479898265
              </a>
            </Button>
            
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
            
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
                Services
              </a>
              <Link to="/hospitals" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Hospitals
              </Link>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="text-primary font-medium">
                    My Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-left text-muted-foreground">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" className="text-primary font-medium">
                  Login / Sign Up
                </Link>
              )}
              
              
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
