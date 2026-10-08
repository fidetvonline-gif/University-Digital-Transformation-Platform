import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { Card, Button, Badge } from '../ui/common';
import { Camera, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const handleUpdate = () => {
    // In a real app, this would call the API to update the profile
    alert('Profile update functionality would be implemented here.');
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-[#0F2137] text-white rounded-full">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0F2137]">{profile?.first_name} {profile?.last_name}</h2>
          <Badge variant="gold" className="mt-2">{profile?.role || 'User'}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name</label>
          <input type="text" value={formData.first_name} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, first_name: e.target.value})}/>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name</label>
          <input type="text" value={formData.last_name} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, last_name: e.target.value})}/>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
          <input type="email" value={formData.email} className="w-full p-2 border rounded" disabled />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
          <input type="text" value={formData.phone} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, phone: e.target.value})}/>
        </div>
      </div>
      
      <Button variant="primary" onClick={handleUpdate}>Update Profile</Button>
    </Card>
  );
};
