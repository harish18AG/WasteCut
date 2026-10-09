import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Check,
  X,
  User,
  MapPin,
  Utensils
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        api.get('/donations?mine=true'),
        api.get('/requests'),
      ]);
      setDonations(donationsRes.data);
      setRequests(requestsRes.data);
    } catch (e) {
      console.error('Failed to fetch donor dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this claim request?`)) return;
    try {
      await api.put(`/requests/${requestId}/status`, { status });
      alert(`Request has been ${status.toLowerCase()} successfully.`);
      fetchData(); // reload
    } catch (e) {
      alert('Failed to update request status.');
    }
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

  // Compute counters
  const activeDonations = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'PENDING' || d.status === 'ACCEPTED' || d.status === 'PICKED_UP');
  const completedDonations = donations.filter((d) => d.status === 'DELIVERED');
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-xs text-gray-500 mt-1">List surplus food dishes and approve community requests instantly</p>
        </div>
        <Link
          to="/donor/donate"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <PlusCircle size={15} /> Create Food Listing
        </Link>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Listings</span>
            <div className="p-2 rounded-lg bg-green-50 text-green-600"><Clock size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{activeDonations.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Currently listed or pending pickups</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed Deliveries</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{completedDonations.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Total meals successfully distributed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Pending Requests</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><HelpCircle size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{pendingRequests.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Claims waiting for your approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Listings Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Your Active Food Listings</h3>
            
            {activeDonations.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                You do not have any active food listings. Click "Create Food Listing" to share surplus food.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeDonations.map((d) => (
                  <div key={d.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.foodName} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Utensils size={18} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-gray-800">{d.foodName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span>Qty: {d.quantity}</span>
                          <span>•</span>
                          <span>Expires: {new Date(d.expiryTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                        d.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' :
                        d.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                        d.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Claim Requests Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Recipient Claims</h3>

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No active recipient claims waiting for approval.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((r) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-gray-800">{r.donation.foodName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Requested by {r.recipient.user.name}</p>
                      </div>
                      <span className="text-[10px] font-bold text-primary">{r.quantityNeeded}</span>
                    </div>
                    
                    {r.notes && (
                      <p className="text-[10px] text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                        "{r.notes}"
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'APPROVED')}
                        className="flex-1 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'REJECTED')}
                        className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <X size={12} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DonorDashboard;
