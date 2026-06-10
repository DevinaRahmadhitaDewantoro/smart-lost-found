import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');


const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Ambil data klaim dari backend
  const fetchClaims = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await axios.get(`${apiUrl}/api/claims`);
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setMessage('❌ Failed to fetch claims data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Menangani aksi Approve / Reject
  const handleAction = async (claimId, action) => {
    try {
      // Menembak rute PATCH baru yang sudah kita buat di backend
      await axios.patch(`${apiUrl}/api/claims/${claimId}`, { status: action });
      setMessage(`✅ Claim successfully ${action === 'approve' ? 'approved' : 'rejected'}!`);
      fetchClaims(); // Ambil data terbaru dari database
    } catch (error) {
      console.error(`Error processing ${action}:`, error);
      setMessage(`❌ Failed to ${action} claim.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-500">Verify, approve, or reject user item claims.</p>
        </div>
        <button 
          onClick={fetchClaims}
          className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
        >
          🔄 Refresh Table
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-medium">Loading claims data... 🔄</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
          No pending return claims found in database.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-4 px-4 rounded-l-xl">Claimer</th>
                <th className="py-4 px-4">Item Details</th>
                <th className="py-4 px-4">Proof Message</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 rounded-r-xl text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {claims.map((claim) => (
                <tr key={claim.claim_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-800 block">{claim.claimer_name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400">{claim.claimer_email}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                 <span className="font-bold text-indigo-600 block">{claim.item_name}</span>
                 <span className="text-xs text-gray-400 capitalize">{claim.item_type} • {claim.item_category}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                    {claim.proof_message || 'No description provided.'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      claim.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      claim.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {claim.status === 'pending' ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleAction(claim.claim_id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(claim.claim_id, 'reject')}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;