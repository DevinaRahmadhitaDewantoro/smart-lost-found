import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all found & lost items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
     const response = await axios.get(`${apiUrl}/api/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search API call
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/search?q=${searchQuery}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Bar Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-2">Find Your Lost Belongings</h2>
        <p className="text-indigo-100 mb-6">Search through university lost and found reports instantly.</p>
        
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Type item name, color, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium shadow-inner"
          />
          <button type="submit" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-md">
            Search
          </button>
        </form>
      </div>

      {/* Items Grid Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Reported Items</h3>
          <button onClick={fetchItems} className="text-sm text-indigo-600 hover:underline">Refresh List</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading items... 🔄</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
            No items found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      item.type === 'found' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.description}</p>
                </div>

                <div className="border-t border-gray-50 pt-3 flex justify-between items-center text-xs text-gray-400">
                  <span>📍 {item.location || 'Campus Area'}</span>
                  <span className={`font-semibold ${item.status === 'Claimed' ? 'text-gray-400 line-through' : 'text-indigo-600'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;