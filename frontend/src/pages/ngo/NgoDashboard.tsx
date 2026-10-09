import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Calendar, CheckCircle2, ChevronRight, Bell, Clock, Package, User, Phone, XCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const NgoDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [pickups, setPickups] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Accept modal state
  const [acceptingDonation, setAcceptingDonation] = useState<any | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const acceptedParams: any = {};
      if (user?.ngoProfile?.latitude && user?.ngoProfile?.longitude) {
        acceptedParams.latitude = user.ngoProfile.latitude;
        acceptedParams.longitude = user.ngoProfile.longitude;
        acceptedParams.distance = 100;
      }

      const [pickupsRes, acceptedRes, pendingRes] = await Promise.all([
        api.get('/pickups'),
        api.get('/donations', { params: { ...acceptedParams, status: 'ACCEPTED' } }),
        api.get('/donations', { params: { ...acceptedParams, status: 'PENDING' } }),
      ]);
      setPickups(pickupsRes.data);

      // Priority list for NGO: combine ACCEPTED and PENDING claims
      const allRequests = [...pendingRes.data, ...acceptedRes.data].filter(
        (d, idx, self) => self.findIndex((x) => x.id === d.id) === idx
      );
      setPendingRequests(allRequests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingDonation || !scheduledTime) return;
    setActionLoading(true);
    const approvedReq = acceptingDonation.requests?.[0];
    try {
      await api.post('/pickups', {
        donationId: acceptingDonation.id,
        scheduledTime: new Date(scheduledTime).toISOString(),
        ...(approvedReq ? { requestId: approvedReq.id } : {}),
      });
      alert('✅ Pickup accepted and scheduled! The donor and recipient have been notified.');
      setAcceptingDonation(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept pickup. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = (donationId: string) => {
    if (!window.confirm('Decline this pickup request? It will remain available for other NGOs.')) return;
    setPendingRequests((prev) => prev.filter((d) => d.id !== donationId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    );
  }

  const activePickups = pickups.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
  const completedPickups = pickups.filter((p) => p.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">NGO Operations Hub</h1>
          <p className="text-xs text-gray-500 mt-1">Manage scheduled surplus claims and log delivery distributions</p>
        </div>
        <Link
          to="/ngo/nearby"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <MapPin size={15} /> Find Food Nearby
        </Link>
      </div>

      {/* ══ PENDING PICKUP REQUESTS SECTION ══ */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 rounded-lg">
                <Bell size={15} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-amber-900">Pickup Requests Awaiting Your Response</h2>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  {pendingRequests.length} donor-approved request{pendingRequests.length > 1 ? 's' : ''} need an NGO to collect and deliver
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((d) => {
              const req = d.requests?.[0];
              return (
                <div key={d.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">

                    {/* Food Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={14} className="text-amber-500" />
                            <h3 className="font-bold text-sm text-gray-900">{d.foodName}</h3>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            Category: <strong className="text-gray-600">{d.category?.replace('_', ' ')}</strong>
                            &nbsp;·&nbsp; Qty: <strong className="text-gray-600">{d.quantity}</strong>
                          </p>
                        </div>
                        {d.distance !== undefined && (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                            <MapPin size={10} /> {d.distance.toFixed(1)} km away
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Collect from */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">📦 Collect From (Donor)</p>
                          <p className="text-xs font-semibold text-gray-800">{d.donor?.user?.name}</p>
                          {d.donor?.user?.phone && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={9} /> {d.donor.user.phone}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={9} /> {d.pickupAddress}
                          </p>
                          <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 font-medium">
                            <Clock size={9} /> Expires: {new Date(d.expiryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>

                        {/* Deliver to */}
                        {req && (
                          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-2">🏠 Deliver To (Recipient)</p>
                            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                              <User size={11} className="text-green-600" /> {req.recipient?.user?.name}
                            </p>
                            {req.recipient?.user?.phone && (
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone size={9} /> {req.recipient.user.phone}
                              </p>
                            )}
                            {req.recipient?.user?.address && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin size={9} /> {req.recipient.user.address}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                              Needs: <strong className="text-gray-600">{req.quantityNeeded} servings</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accept / Decline buttons */}
                    <div className="flex md:flex-col gap-3 shrink-0 md:w-36">
                      <button
                        onClick={() => {
                          setAcceptingDonation(d);
                          const t = new Date();
                          t.setHours(t.getHours() + 1);
                          setScheduledTime(t.toISOString().slice(0, 16));
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleDecline(d.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Pickups</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Navigation size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{activePickups.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Scheduled or en route right now</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed Collections</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{completedPickups.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Total loads distributed successfully</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Scheduled Actions</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><Calendar size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">
            {pickups.filter((p) => p.status === 'SCHEDULED').length}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Upcoming pickups on timeline</p>
        </div>
      </div>

      {/* Timetable lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-800">Your Current Pickups</h3>
              <Link to="/ngo/pickups" className="text-xs font-bold text-primary flex items-center gap-1">
                View Tracker <ChevronRight size={14} />
              </Link>
            </div>

            {activePickups.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No active pickups scheduled. Accept a request above or click "Find Food Nearby".
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activePickups.map((p) => (
                  <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-gray-800">{p.donation.foodName}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5"><MapPin size={10} /> {p.donation.pickupAddress}</span>
                        <span>•</span>
                        <span>Time: {new Date(p.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                      p.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600' :
                      p.status === 'EN_ROUTE' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Quick List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Recent Distribution Logs</h3>
            {completedPickups.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">No deliveries logged yet.</div>
            ) : (
              <div className="space-y-3">
                {completedPickups.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-gray-700">{p.donation.foodName}</h4>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Delivered on {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Rescued</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Accept Pickup Modal ── */}
      {acceptingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-premium border border-gray-100 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Confirm Pickup Acceptance</h3>
              <p className="text-xs text-gray-500 mt-1">
                You are accepting to collect <strong>"{acceptingDonation.foodName}"</strong> from the donor and deliver it to the recipient.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Collect from</p>
                <p className="font-semibold text-gray-700">{acceptingDonation.donor?.user?.name}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{acceptingDonation.pickupAddress}</p>
              </div>
              {acceptingDonation.requests?.[0] && (
                <div className="bg-green-50 rounded-xl p-3 text-xs border border-green-100">
                  <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Deliver to</p>
                  <p className="font-semibold text-gray-700">{acceptingDonation.requests[0].recipient?.user?.name}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">{acceptingDonation.requests[0].recipient?.user?.address || 'Address on file'}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Select Your Pickup Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-amber-600 mt-1.5 font-medium">
                  ⚠️ Food expires at {new Date(acceptingDonation.expiryTime).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Scheduling...</>
                  ) : (
                    <><CheckCircle size={14} /> Confirm & Accept</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAcceptingDonation(null)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all"
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
export default NgoDashboard;

