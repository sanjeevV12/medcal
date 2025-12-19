import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  User, Phone, MapPin, Heart, Plus, Trash2, 
  Calendar, FileText, LogOut, Home, Activity, Users
} from 'lucide-react';

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  blood_group: string | null;
  date_of_birth: string | null;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean | null;
}

interface MedicalHistory {
  id: string;
  condition: string;
  diagnosis_date: string | null;
  notes: string | null;
  is_ongoing: boolean | null;
}

interface BookingRecord {
  id: string;
  service_type: string;
  booking_date: string;
  status: string | null;
  amount: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '', address: '', blood_group: '', date_of_birth: '' });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [newCondition, setNewCondition] = useState({ condition: '', notes: '' });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchContacts();
      fetchMedicalHistory();
      fetchBookings();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
    if (data) setProfile(data);
  };

  const fetchContacts = async () => {
    const { data } = await supabase.from('emergency_contacts').select('*').eq('user_id', user?.id);
    if (data) setContacts(data);
  };

  const fetchMedicalHistory = async () => {
    const { data } = await supabase.from('medical_history').select('*').eq('user_id', user?.id);
    if (data) setMedicalHistory(data);
  };

  const fetchBookings = async () => {
    const { data } = await supabase.from('booking_records').select('*').eq('user_id', user?.id).order('booking_date', { ascending: false });
    if (data) setBookings(data);
  };

  const updateProfile = async () => {
    const { error } = await supabase.from('profiles').update(profile).eq('user_id', user?.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile updated successfully' });
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({ title: 'Error', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('emergency_contacts').insert({
      user_id: user?.id,
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || null
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to add contact', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Emergency contact added' });
      setNewContact({ name: '', phone: '', relationship: '' });
      fetchContacts();
    }
  };

  const deleteContact = async (id: string) => {
    await supabase.from('emergency_contacts').delete().eq('id', id);
    fetchContacts();
  };

  const addMedicalCondition = async () => {
    if (!newCondition.condition) {
      toast({ title: 'Error', description: 'Condition is required', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('medical_history').insert({
      user_id: user?.id,
      condition: newCondition.condition,
      notes: newCondition.notes || null
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to add condition', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Medical condition added' });
      setNewCondition({ condition: '', notes: '' });
      fetchMedicalHistory();
    }
  };

  const deleteMedicalCondition = async (id: string) => {
    await supabase.from('medical_history').delete().eq('id', id);
    fetchMedicalHistory();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'contacts', label: 'Emergency', icon: Users },
    { id: 'medical', label: 'Medical', icon: Activity },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">My Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Input value={profile.blood_group || ''} onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })} placeholder="A+, B-, O+, etc." />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={profile.date_of_birth || ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Your complete address in Bhopal, MP" />
              </div>
            </div>
            <Button onClick={updateProfile} className="mt-6">Save Profile</Button>
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Emergency Contact
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Input placeholder="Contact Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                <Input placeholder="Phone Number" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                <Input placeholder="Relationship (optional)" value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} />
              </div>
              <Button onClick={addContact} className="mt-4">Add Contact</Button>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Emergency Contacts</h2>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground">No emergency contacts added yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone} {contact.relationship && `• ${contact.relationship}`}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteContact(contact.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Medical Condition
              </h2>
              <div className="space-y-4">
                <Input placeholder="Condition (e.g., Diabetes, Hypertension)" value={newCondition.condition} onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })} />
                <Textarea placeholder="Notes (optional)" value={newCondition.notes} onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })} />
              </div>
              <Button onClick={addMedicalCondition} className="mt-4">Add Condition</Button>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Medical History</h2>
              {medicalHistory.length === 0 ? (
                <p className="text-muted-foreground">No medical conditions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {medicalHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{item.condition}</p>
                        {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteMedicalCondition(item.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Booking Records
            </h2>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No booking records yet. Book a service from the home page!</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground capitalize">{booking.service_type}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.booking_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-accent/20 text-accent' :
                        booking.status === 'pending' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.amount && <p className="text-sm text-primary font-medium mt-1">{booking.amount}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
