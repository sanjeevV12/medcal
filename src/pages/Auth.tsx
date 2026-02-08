import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Heart, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return false;
    }
    try {
      passwordSchema.parse(password);
    } catch {
      toast({ title: 'Invalid password', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return false;
    }
    if (!isLogin && !fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setIsLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({ title: 'Login Failed', description: 'Invalid email or password', variant: 'destructive' });
        } else {
          toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Welcome back!', description: 'Successfully logged in' });
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({ title: 'Account Exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
        } else {
          toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Account Created!', description: 'Welcome to mASSI' });
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin ? 'Login to access your health records' : 'Join mASSI for better healthcare'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium ml-2 hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-card/50 rounded-xl">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-xs text-muted-foreground">Medical History</p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl">
              <div className="text-2xl mb-2">📞</div>
              <p className="text-xs text-muted-foreground">Emergency Contacts</p>
            </div>
            <div className="p-4 bg-card/50 rounded-xl">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-xs text-muted-foreground">Booking Records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
