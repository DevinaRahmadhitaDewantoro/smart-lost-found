import React, { useState } from 'react';
import axios from 'axios';

function ReportItem() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    type: 'lost', 
    location: '',
    user_id: 1 // Simulasi user ID 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
     const response = await axios.post(`${apiUrl}/api/items`, formData);
      setMessage(`✅ Success! Item reported. ${response.data.match_info || ''}`);
      setFormData({
        name: '',
        category: '',
        description: '',
        type: 'lost',
        location: '',
        user_id: 1
      });
    } catch (error) {
      console.error('Error reporting item:', error);
      setMessage('❌ Failed to submit report. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Lost or Found Item</h2>
      <p className="text-sm text-gray-500 mb-6">Fill in the details to trigger the automatic system matching.</p>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`py-3 rounded-xl font-bold border transition-all cursor-pointer ${formData.type === 'lost' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFormData({ ...formData, type: 'lost' })}
            >
              💼 Lost Item
            </button>
            <button
              type="button"
              className={`py-3 rounded-xl font-bold border transition-all cursor-pointer ${formData.type === 'found' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFormData({ ...formData, type: 'found' })}
            >
              ✨ Found Item
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., KTM Card, Black Backpack"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents/Cards</option>
              <option value="Bags & Wallets">Bags & Wallets</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., MIPA Canteen, Library"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            name="description"
            rows="4"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide specific marks, color details..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400 cursor-pointer"
        >
          {loading ? 'Submitting... 🔄' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default ReportItem;