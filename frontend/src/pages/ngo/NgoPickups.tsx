import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck, CheckCircle, Navigation, X } from 'lucide-react';
import api from '../../services/api';

export const NgoPickups: React.FC = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation state
  const [confirmingPickupId, setConfirmingPickupId] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState('');

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pickups');
      setPickups(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, deliveryConfirm?: string) => {
    try {
      await api.put(`/pickups/${id}/status`, { status, deliveryConfirm });
      alert(`Pickup status updated to ${status.replace('_', ' ')}.`);
      setConfirmingPickupId(null);
      setConfirmCode('');
      fetchPickups(); // reload
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-44 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const activePickups = pickups.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
  const pastPickups = pickups.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED');

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
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pickup Dispatch Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your driving phases and log delivery confirmations</p>
        </div>
      </div>

      {/* Active pickups */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-gray-800">Active Schedules</h3>
        
        {activePickups.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-50 text-xs text-gray-400">
            No active schedules running.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePickups.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-50 flex flex-col justify-between gap-6">
                
                {/* Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{p.donation.foodName}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Donor: <span className="font-semibold text-gray-700">{p.donation.donor.user.name}</span>
                        {p.donation.donor.user.phone && (
                          <span className="ml-2 font-bold text-primary">
                            📞 {p.donation.donor.user.phone}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                      p.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600' :
                      p.status === 'EN_ROUTE' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {p.donation.pickupAddress}</div>
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> Dispatch: {new Date(p.scheduledTime).toLocaleString()}</div>
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex gap-2 flex-wrap">
                    {p.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'EN_ROUTE')}
                        className="flex-1 min-w-[100px] py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                      >
                        <Truck size={14} /> Start Route
                      </button>
                    )}
                    
                    {p.status === 'EN_ROUTE' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'ARRIVED')}
                        className="flex-1 min-w-[100px] py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                      >
                        <Navigation size={14} /> Arrived at Location
                      </button>
                    )}

                    {p.status === 'ARRIVED' && (
                      <button
                        onClick={() => setConfirmingPickupId(p.id)}
                        className="flex-1 min-w-[100px] py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} /> Complete Delivery
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(p.id, 'CANCELLED')}
                      className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 text-xs font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical records */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-800">Historical Dispatches</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Food Name</th>
                <th className="px-6 py-3">Donor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Receipt Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pastPickups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                    No historical pickup dispatches log.
                  </td>
                </tr>
              ) : (
                pastPickups.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{p.donation.foodName}</td>
                    <td className="px-6 py-4 text-xs">{p.donation.donor.user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {p.status === 'CANCELLED' ? 'Cancelled by NGO' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs italic">{p.deliveryConfirm || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation dialog overlay */}
      {confirmingPickupId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-premium border border-gray-100 space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-800 font-outfit">Confirm Food Handoff</h3>
              <p className="text-xs text-gray-500 mt-1">Enter the secure 6-digit OTP code sent to the donor's email address / dashboard notifications to verify collection.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Donor Verification OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold tracking-widest text-center focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(confirmingPickupId, 'COMPLETED', confirmCode)}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Verify & Log
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingPickupId(null)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NgoPickups;
