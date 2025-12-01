import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface DeliveryTask {
  id: string;
  medicineId: string;
  type: 'pickup' | 'delivery';
  status: 'assigned' | 'in_progress' | 'completed';
  fromAddress: any;
  toAddress: any;
  assignedAt: any;
  medicineName?: string;
}

const VolunteerDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    if (!user) return;
    
    const q = query(
      collection(db, 'deliveries'),
      where('volunteerId', '==', user.uid),
      where('status', 'in', ['assigned', 'in_progress'])
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DeliveryTask[];
      
      // Fetch medicine names for each task
      for (let task of taskList) {
        const medicineDoc = await getDocs(query(collection(db, 'medicines'), where('__name__', '==', task.medicineId)));
        if (!medicineDoc.empty) {
          task.medicineName = medicineDoc.docs[0].data().medicineName;
        }
      }
      
      setTasks(taskList);
    });

    return unsubscribe;
  };

  const updateTaskStatus = async (taskId: string, newStatus: string, medicineId: string) => {
    setLoading(true);
    try {
      // Update delivery task status
      await updateDoc(doc(db, 'deliveries', taskId), {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null
      });

      // Update medicine delivery status based on task completion
      let medicineStatus = '';
      if (newStatus === 'in_progress') {
        medicineStatus = 'picked_up';
      } else if (newStatus === 'completed') {
        medicineStatus = 'in_warehouse'; // or 'delivered' based on task type
      }

      if (medicineStatus) {
        await updateDoc(doc(db, 'medicines', medicineId), {
          deliveryStatus: medicineStatus,
          updatedAt: new Date()
        });
      }

      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8">Volunteer Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Assigned Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{task.medicineName || 'Medicine'}</h3>
                    <p className="text-gray-600 capitalize">{task.type} Task</p>
                    <span className={`inline-block px-2 py-1 rounded text-sm mt-2 ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    Assigned: {task.assignedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-700">From:</h4>
                    <p className="text-sm text-gray-600">
                      {task.fromAddress?.address || 'Address not available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">To:</h4>
                    <p className="text-sm text-gray-600">
                      {task.toAddress?.address || 'Warehouse'}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress', task.medicineId)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed', task.medicineId)}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">No tasks assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;