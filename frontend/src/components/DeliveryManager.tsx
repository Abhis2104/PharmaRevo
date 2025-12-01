import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SampleDataCreator from './SampleDataCreator';

interface Medicine {
  id: string;
  medicineName: string;
  donorId: string;
  deliveryStatus: string;
  source?: string;
  pickupAddress: {
    address: string;
    city: string;
    pinCode: string;
  };
  assignedVolunteerId?: string;
}

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  availableAreas: string[];
  isActive: boolean;
}

const DeliveryManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [ngoRequests, setNgoRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pickup');
  const [pickupSubTab, setPickupSubTab] = useState('donor');
  const [dropSubTab, setDropSubTab] = useState('ngo');

  useEffect(() => {
    fetchPendingMedicines();
    fetchActiveVolunteers();
    fetchNgoRequests();
  }, []);

  const fetchPendingMedicines = async () => {
    try {
      const q = query(
        collection(db, 'donations'),
        where('status', '==', 'Approved')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const medicineList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Medicine[];
        
        const pendingPickup = medicineList.filter(med => 
          !med.deliveryStatus || med.deliveryStatus === 'pending_pickup'
        );
        
        setMedicines(pendingPickup);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching pending medicines:', error);
      setMedicines([]);
    }
  };

  const fetchActiveVolunteers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'volunteers'));
      const volunteerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Volunteer[];
      console.log('Fetched volunteers:', volunteerList);
      setVolunteers(volunteerList.filter(vol => vol.isActive !== false));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const fetchNgoRequests = async () => {
    try {
      const q = query(
        collection(db, 'ngo_requests'),
        where('status', '==', 'Approved')
      );
      
      const snapshot = await getDocs(q);
      const requestList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNgoRequests(requestList);
    } catch (error) {
      console.error('Error fetching NGO requests:', error);
    }
  };

  const assignVolunteer = async (medicineId: string, volunteerId: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'donations', medicineId), {
        assignedVolunteerId: volunteerId,
        deliveryStatus: 'assigned_for_pickup',
        updatedAt: new Date()
      });

      await addDoc(collection(db, 'deliveries'), {
        medicineId,
        volunteerId,
        type: 'pickup',
        status: 'assigned',
        assignedAt: new Date(),
        completedAt: null
      });

      alert('Volunteer assigned successfully!');
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      alert('Failed to assign volunteer');
    }
    setLoading(false);
  };

  const getAvailableVolunteers = (pinCode: string) => {
    if (!pinCode || !volunteers.length) return [];
    return volunteers.filter(vol => 
      vol.availableAreas && vol.availableAreas.includes(pinCode)
    );
  };

  const getFilteredMedicines = () => {
    return medicines.filter(med => {
      if (pickupSubTab === 'donor') return !med.source || med.source === 'individual';
      if (pickupSubTab === 'pharmacy') return med.source === 'pharmacy';
      if (pickupSubTab === 'company') return med.source === 'company';
      return true;
    });
  };

  const renderPickupSection = () => {
    const filteredMedicines = getFilteredMedicines();
    
    return (
      <div className="space-y-4">
        {/* Pickup Sub-tabs */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setPickupSubTab('donor')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              pickupSubTab === 'donor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🤝 Donor ({medicines.filter(m => !m.source || m.source === 'individual').length})
          </button>
          <button
            onClick={() => setPickupSubTab('pharmacy')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              pickupSubTab === 'pharmacy'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏪 Pharmacy ({medicines.filter(m => m.source === 'pharmacy').length})
          </button>
          <button
            onClick={() => setPickupSubTab('company')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              pickupSubTab === 'company'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏢 Company ({medicines.filter(m => m.source === 'company').length})
          </button>
        </div>

        {/* Pickup Items */}
        <div className="space-y-4">
          {filteredMedicines.map((medicine) => {
            const pinCode = medicine.pickupAddress?.pinCode || medicine.pinCode || '';
            const availableVolunteers = getAvailableVolunteers(pinCode);
            
            return (
              <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{medicine.medicineName}</h3>
                    <p className="text-gray-600">
                      Pickup: {medicine.pickupAddress?.address || medicine.address || 'Address not available'}, {medicine.pickupAddress?.city || medicine.city || 'City not available'} - {pinCode || 'Pin not available'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        {(medicine.deliveryStatus || 'pending_pickup').replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        medicine.source === 'pharmacy' ? 'bg-purple-100 text-purple-800' :
                        medicine.source === 'company' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {medicine.source === 'pharmacy' ? '🏪 Pharmacy' :
                         medicine.source === 'company' ? '🏢 Company' : '🤝 Donor'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Total volunteers: {volunteers.length} | Available: {availableVolunteers.length}
                    </div>
                    {volunteers.length === 0 ? (
                      <span className="text-orange-500 text-sm">No volunteers registered</span>
                    ) : availableVolunteers.length > 0 ? (
                      <select 
                        className="border border-gray-300 rounded px-3 py-2"
                        onChange={(e) => e.target.value && assignVolunteer(medicine.id, e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Volunteer</option>
                        {availableVolunteers.map((volunteer) => (
                          <option key={volunteer.id} value={volunteer.id}>
                            {volunteer.name} ({volunteer.vehicleType})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <span className="text-red-500 text-sm block">No volunteers for pin: {pinCode}</span>
                        <select className="border border-gray-300 rounded px-3 py-2 mt-1 text-sm">
                          <option>All volunteers:</option>
                          {volunteers.map((vol) => (
                            <option key={vol.id} disabled>
                              {vol.name} - Areas: {vol.availableAreas?.join(', ') || 'None'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredMedicines.length === 0 && (
            <p className="text-gray-500 text-center py-8">No medicines pending pickup from {pickupSubTab}s</p>
          )}
        </div>
      </div>
    );
  };

  const renderDropSection = () => {
    return (
      <div className="space-y-4">
        {/* Drop Sub-tabs */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setDropSubTab('ngo')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              dropSubTab === 'ngo'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏥 NGO/Hospital ({ngoRequests.length})
          </button>
          <button
            onClick={() => setDropSubTab('need')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              dropSubTab === 'need'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🆘 Emergency Need (0)
          </button>
        </div>

        {/* Drop Items */}
        <div className="space-y-4">
          {dropSubTab === 'ngo' && ngoRequests.map((request) => {
            const pinCode = request.deliveryPinCode || '';
            const availableVolunteers = getAvailableVolunteers(pinCode);
            
            return (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{request.organizationName}</h3>
                    <p className="text-gray-600">
                      Drop: {request.deliveryAddress || 'Address not available'}, {request.deliveryCity || 'City not available'} - {pinCode || 'Pin not available'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Items: {request.items?.length || 0} medicines requested
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        APPROVED FOR DELIVERY
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-pink-100 text-pink-800">
                        🏥 {request.organizationType || 'NGO/Hospital'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Total volunteers: {volunteers.length} | Available: {availableVolunteers.length}
                    </div>
                    {volunteers.length === 0 ? (
                      <span className="text-orange-500 text-sm">No volunteers registered</span>
                    ) : availableVolunteers.length > 0 ? (
                      <select 
                        className="border border-gray-300 rounded px-3 py-2"
                        onChange={(e) => e.target.value && assignVolunteer(request.id, e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Volunteer</option>
                        {availableVolunteers.map((volunteer) => (
                          <option key={volunteer.id} value={volunteer.id}>
                            {volunteer.name} ({volunteer.vehicleType})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <span className="text-red-500 text-sm block">No volunteers for pin: {pinCode}</span>
                        <select className="border border-gray-300 rounded px-3 py-2 mt-1 text-sm">
                          <option>All volunteers:</option>
                          {volunteers.map((vol) => (
                            <option key={vol.id} disabled>
                              {vol.name} - Areas: {vol.availableAreas?.join(', ') || 'None'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {dropSubTab === 'need' && (
            <p className="text-gray-500 text-center py-8">No emergency needs at the moment</p>
          )}
          
          {dropSubTab === 'ngo' && ngoRequests.length === 0 && (
            <p className="text-gray-500 text-center py-8">No approved NGO requests for delivery</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SampleDataCreator />
      
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-6">Logistics Management</h2>
        
        {/* Main Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'pickup'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📦 Pickup Operations
          </button>
          <button
            onClick={() => setActiveTab('drop')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'drop'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚚 Drop Operations
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pickup' && renderPickupSection()}
        {activeTab === 'drop' && renderDropSection()}
      </div>
    </div>
  );
};

export default DeliveryManager;