import React, { useState } from 'react'
import axios from 'axios'

export default function Donate(){
  const [form, setForm] = useState({ name: '', brand: '', expiryDate: '', quantity: 1 })
  const onChange = e => setForm({...form, [e.target.name]: e.target.value})
  const submit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.keys(form).forEach(k=>fd.append(k, form[k]));
    try{
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/medicines`, fd, { headers: { Authorization: `Bearer ${token}` } });
      alert('Donated');
    }catch(err){ alert('Error') }
  }
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold">Donate Medicines</h1>
      <form onSubmit={submit} className="space-y-3 mt-4 max-w-md">
        <input name="name" onChange={onChange} placeholder="Medicine name" className="w-full p-2 border rounded" />
        <input name="brand" onChange={onChange} placeholder="Brand" className="w-full p-2 border rounded" />
        <input name="expiryDate" type="date" onChange={onChange} className="w-full p-2 border rounded" />
        <input name="quantity" type="number" onChange={onChange} className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Donate</button>
      </form>
    </div>
  )
}
