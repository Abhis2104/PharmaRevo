const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface BatchData {
  batchNumber: string;
  medicineName: string;
  expiryDate: string;
  manufacturingDate: string;
  quantity: number;
  reason: string;
  pickupAddress: string;
  city: string;
  pinCode: string;
  landmark: string;
}

export const companyService = {
  // Submit batch to backend
  async submitBatch(batchData: BatchData, token: string) {
    const response = await fetch(`${API_BASE_URL}/company/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(batchData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit batch');
    }

    return response.json();
  },

  // Get company batches
  async getCompanyBatches(token: string) {
    const response = await fetch(`${API_BASE_URL}/company/batches`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }

    return response.json();
  },

  // Admin: Get all batches
  async getAllBatches(token: string) {
    const response = await fetch(`${API_BASE_URL}/company/admin/batches`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all batches');
    }

    return response.json();
  },

  // Admin: Update batch status
  async updateBatchStatus(batchId: string, status: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/company/admin/batch/${batchId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update batch status');
    }

    return response.json();
  }
};