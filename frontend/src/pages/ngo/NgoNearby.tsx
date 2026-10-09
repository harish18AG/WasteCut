import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Utensils, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const NgoNearby: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Available surplus donations (AVAILABLE status)
  const [donations, setDonations] = useState<any[]>([]);
  // Approved recipient requests waiting for NGO pickup (ACCEPTED status)
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState<number>(25); // max 25km default
  
  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  // Holds the requestId when scheduling for an approved recipient request
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (user?.ngoProfile?.latitude && user?.ngoProfile?.longitude) {
        params.latitude = user.ngoProfile.latitude;
        params.longitude = user.ngoProfile.longitude;
        params.distance = distance;
      }
      if (category) params.category = category;
      if (search) params.search = search;

      // Fetch AVAILABLE donations (open surplus)
      const [availRes, acceptedRes, pendingRes] = await Promise.all([
        api.get('/donations', { params: { ...params, status: 'AVAILABLE' } }),
        api.get('/donations', { params: { ...params, status: 'ACCEPTED' } }),
        api.get('/donations', { params: { ...params, status: 'PENDING' } }),
      ]);
      setDonations(availRes.data);

      // Combine ACCEPTED and PENDING requests awaiting NGO action
      const combinedApproved = [...pendingRes.data, ...acceptedRes.data].filter(
        (d, idx, self) => self.findIndex((x) => x.id === d.id) === idx
      );
      setApprovedRequests(combinedApproved);
    } catch (e) {
      console.error('Failed to load nearby donations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [category, distance]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNearby();
  };

  const handleSchedulePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation || !scheduledTime) return;

    try {
      await api.post('/pickups', {
        donationId: selectedDonation.id,
        scheduledTime: new Date(scheduledTime).toISOString(),
        // Pass requestId so the pickup is linked to the approved recipient request
        ...(pendingRequestId ? { requestId: pendingRequestId } : {}),
      });
      alert('Pickup scheduled successfully! The donor and recipient have been notified.');
      setSelectedDonation(null);
      setPendingRequestId(null);
      fetchNearby();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to schedule pickup.');
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
          onClick={() => navigate('/ngo')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Nearby Surplus Food</h1>
          <p className="text-xs text-gray-500 mt-0.5">Explore active surplus food items within your distribution reach</p>
        </div>
      </div>

      {/* ── PRIORITY: Approved Requests Awaiting Pickup ── */}
      {!loading && approvedRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-amber-500" />
            <h3 className="font-bold text-sm text-amber-700">Approved Requests Awaiting Pickup</h3>
            <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">{approvedRequests.length}</span>
          </div>
          <p className="text-[11px] text-gray-400">These donations have been approved for a specific recipient — schedule a pickup to complete the delivery.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedRequests.map((d) => {
              const approvedReq = d.requests?.[0];
              return (
                <div key={d.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full uppercase mb-1.5">Recipient Assigned</span>
                      <h3 className="font-bold text-sm text-gray-900">{d.foodName}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Donor: <strong>{d.donor.user.name}</strong></p>
                    </div>
                    {d.distance !== undefined && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        <MapPin size={10} /> {d.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  {approvedReq && (
                    <div className="bg-white rounded-xl p-3 border border-amber-100 text-xs space-y-1">
                      <p className="font-bold text-gray-700 text-[11px] mb-1">📦 Deliver to:</p>
                      <p className="text-gray-700 font-semibold">{approvedReq.recipient.user.name}</p>
                      {approvedReq.recipient.user.phone && (
                        <p className="text-gray-500">📞 {approvedReq.recipient.user.phone}</p>
                      )}
                      {approvedReq.recipient.user.address && (
                        <p className="text-gray-500">📍 {approvedReq.recipient.user.address}</p>
                      )}
                      <p className="text-gray-400 text-[10px]">Qty requested: <strong>{approvedReq.quantityNeeded}</strong></p>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 flex gap-4">
                    <span>Pickup: <strong className="text-gray-600">{d.pickupAddress}</strong></span>
                    <span>Qty: <strong className="text-gray-600">{d.quantity}</strong></span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDonation(d);
                      setPendingRequestId(approvedReq?.id || null);
                      const defaultTime = new Date();
                      defaultTime.setHours(defaultTime.getHours() + 1);
                      setScheduledTime(defaultTime.toISOString().slice(0, 16));
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Schedule Pickup for Recipient
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      {!loading && approvedRequests.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Open Surplus Listings</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      )}

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-4 flex-wrap md:flex-nowrap">
          <input
            type="text"
            placeholder="Search keywords (e.g. biryani, bread)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex gap-6 items-center flex-wrap pt-2 border-t border-gray-50">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Distance Slider */}
          <div className="flex-1 min-w-[200px] flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Distance Range:</span>
            <input
              type="range"
              min="2"
              max="100"
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
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">There are no available surplus food listings matching your distance or category filters at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl shadow-soft hover:shadow-premium transition-all border border-gray-50 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Photo banner */}
                <div className="h-44 bg-gray-100 relative">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.foodName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils size={36} /></div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/95 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-gray-100/40 uppercase">
                    {d.category.replace('_', ' ')}
                  </span>
                  {d.distance !== undefined && (
                    <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                      <MapPin size={10} /> {d.distance.toFixed(1)} km away
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{d.foodName}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Prepared by: {d.donor.user.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {d.description || 'No description provided.'}
                  </p>

                  <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                    <div>Quantity: <strong className="text-gray-700">{d.quantity}</strong></div>
                    <div>Expires: <strong className="text-gray-700">{new Date(d.expiryTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</strong></div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    setSelectedDonation(d);
                    // default scheduled time to now + 1 hour
                    const defaultTime = new Date();
                    defaultTime.setHours(defaultTime.getHours() + 1);
                    setScheduledTime(defaultTime.toISOString().slice(0, 16));
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Claim & Schedule Pickup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-premium border border-gray-100 space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-800">Schedule Pickup</h3>
              <p className="text-xs text-gray-500 mt-1">Confirm your dispatch time for claiming "{selectedDonation.foodName}"</p>
            </div>

            <form onSubmit={handleSchedulePickup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Scheduled Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="text-[10px] text-amber-600 mt-2 font-medium">
                  Food expires at {new Date(selectedDonation.expiryTime).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Confirm Schedule
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
export default NgoNearby;
