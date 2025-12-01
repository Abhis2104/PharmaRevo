import { collection, doc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface DeliveryStatus {
  PENDING_PICKUP: 'pending_pickup';
  ASSIGNED_FOR_PICKUP: 'assigned_for_pickup';
  PICKED_UP: 'picked_up';
  IN_WAREHOUSE: 'in_warehouse';
  OUT_FOR_DELIVERY: 'out_for_delivery';
  DELIVERED: 'delivered';
}

export const DELIVERY_STATUS: DeliveryStatus = {
  PENDING_PICKUP: 'pending_pickup',
  ASSIGNED_FOR_PICKUP: 'assigned_for_pickup',
  PICKED_UP: 'picked_up',
  IN_WAREHOUSE: 'in_warehouse',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered'
};

// Update medicine delivery status
export const updateMedicineDeliveryStatus = async (medicineId: string, status: string) => {
  await updateDoc(doc(db, 'medicines', medicineId), {
    deliveryStatus: status,
    updatedAt: new Date()
  });
};

// Create delivery task
export const createDeliveryTask = async (medicineId: string, volunteerId: string, type: 'pickup' | 'delivery') => {
  return await addDoc(collection(db, 'deliveries'), {
    medicineId,
    volunteerId,
    type,
    status: 'assigned',
    assignedAt: new Date(),
    completedAt: null
  });
};

// Get available volunteers for a pin code
export const getAvailableVolunteers = async (pinCode: string) => {
  const q = query(
    collection(db, 'volunteers'),
    where('isActive', '==', true),
    where('availableAreas', 'array-contains', pinCode)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get medicines by delivery status
export const getMedicinesByDeliveryStatus = async (status: string) => {
  const q = query(
    collection(db, 'medicines'),
    where('deliveryStatus', '==', status)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};