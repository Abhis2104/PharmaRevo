import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SampleDataCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const createSampleVolunteers = async () => {
    setLoading(true);
    try {
      const sampleVolunteers = [
        {
          name: 'Rahul Sharma',
          phone: '+91-9876543210',
          email: 'rahul@example.com',
          vehicleType: 'bike',
          availableAreas: ['400001', '400002', '400003'],
          isActive: true,
          rating: 4.8,
          totalDeliveries: 15,
          createdAt: new Date()
        },
        {
          name: 'Priya Patel',
          phone: '+91-9876543211',
          email: 'priya@example.com',
          vehicleType: 'car',
          availableAreas: ['400004', '400005', '400006'],
          isActive: true,
          rating: 4.9,
          totalDeliveries: 22,
          createdAt: new Date()
        },
        {
          name: 'Amit Kumar',
          phone: '+91-9876543212',
          email: 'amit@example.com',
          vehicleType: 'van',
          availableAreas: ['400007', '400008', '400009'],
          isActive: true,
          rating: 4.7,
          totalDeliveries: 18,
          createdAt: new Date()
        }
      ];

      for (const volunteer of sampleVolunteers) {
        await addDoc(collection(db, 'volunteers'), volunteer);
      }

      alert('Sample volunteers created successfully!');
    } catch (error) {
      console.error('Error creating sample volunteers:', error);
      alert('Failed to create sample volunteers');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Setup Sample Data</h3>
      <p className="text-sm text-gray-600 mb-4">
        Create sample volunteers to test the logistics system
      </p>
      <button
        onClick={createSampleVolunteers}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Sample Volunteers'}
      </button>
    </div>
  );
};

export default SampleDataCreator;