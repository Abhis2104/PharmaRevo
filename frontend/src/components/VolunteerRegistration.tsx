import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase';

const VolunteerRegistration: React.FC = () => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'bike',
    availableAreas: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in first');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.availableAreas.trim()) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const volunteerData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        availableAreas: formData.availableAreas.split(',').map(area => area.trim()),
        email: user.email,
        userId: user.uid,
        rating: 5.0,
        totalDeliveries: 0,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'volunteers'), volunteerData);
      alert('Volunteer registration successful!');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        vehicleType: 'bike',
        availableAreas: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error registering volunteer:', error);
      alert('Failed to register as volunteer');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Become a Volunteer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select
            value={formData.vehicleType}
            onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Areas (Pin Codes)</label>
          <input
            type="text"
            value={formData.availableAreas}
            onChange={(e) => setFormData({...formData, availableAreas: e.target.value})}
            placeholder="e.g., 400001, 400002, 400003"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Enter pin codes separated by commas</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register as Volunteer'}
        </button>
      </form>
    </div>
  );
};

export default VolunteerRegistration;