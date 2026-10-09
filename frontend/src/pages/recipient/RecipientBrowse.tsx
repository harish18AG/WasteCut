import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, SlidersHorizontal, Utensils, HeartHandshake } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const RecipientBrowse: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState<number>(20);
  
  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [quantityNeeded, setQuantityNeeded] = useState('');
  const [notes, setNotes] = useState('');

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const params: any = { status: 'AVAILABLE' };
      if (user?.recipientProfile?.latitude && user?.recipientProfile?.longitude) {
        params.latitude = user.recipientProfile.latitude;
        params.longitude = user.recipientProfile.longitude;
        params.distance = distance;
      }
      if (category) params.category = category;
      if (search) params.search = search;

      const res = await api.get('/donations', { params });
      setDonations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, [category, distance]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAvailable();
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation || !quantityNeeded) return;

    try {
      await api.post('/requests', {
        donationId: selectedDonation.id,
        quantityNeeded,
        notes,
      });
      alert('Claim request submitted successfully! The donor has been notified.');
      setSelectedDonation(null);
      navigate('/recipient');
    } catch (err: any) {
      alert(err.message || 'Failed to request food.');
    }
  };

  const categories = [
    'VEGETARIAN',
    'NON_VEGETARIAN',
    'BAKERY',
    'FRUITS',
    'VEGETABLES',
    'RICE',
    'SNACKS',
    'BEVERAGES',
    'DAIRY',
    'DESSERTS',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recipient')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Available surplus food listings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Explore hot buffer food and bakery items near Springfield Shelter</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex gap-6 items-center flex-wrap pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px] flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Distance Range:</span>
            <input
              type="range"
              min="2"
              max="50"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{distance} km</span>
          </div>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 shimmer rounded-2xl" />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-50">
          <Utensils size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-sm text-gray-700">No Food Listings Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-50 shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-44 bg-gray-100 relative">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.foodName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils size={36} /></div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/95 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {d.category.replace('_', ' ')}
                  </span>
                  {d.distance !== undefined && (
                    <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <MapPin size={10} /> {d.distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{d.foodName}</h3>
                    <p className="text-[10px] text-gray-400">By: {d.donor.user.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {d.description || 'No ingredients or descriptions listed.'}
                  </p>

                  <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                    <div>Quantity: <strong className="text-gray-700">{d.quantity}</strong></div>
                    <div>Expires: <strong className="text-gray-700">{new Date(d.expiryTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</strong></div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    setSelectedDonation(d);
                    setQuantityNeeded(d.quantity); // prefill with max available
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Request Surplus Food
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-premium border border-gray-100 space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5"><HeartHandshake size={18} className="text-primary" /> Claim surplus food</h3>
              <p className="text-xs text-gray-500 mt-1">Specify portion size and delivery notes for "{selectedDonation.foodName}"</p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Quantity Needed</label>
                <input
                  type="text"
                  required
                  value={quantityNeeded}
                  onChange={(e) => setQuantityNeeded(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. 10 portions"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Notes for NGO Driver / Donor (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="e.g. Please deliver to back-door ramp of shelter."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Confirm Claim Request
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default RecipientBrowse;
