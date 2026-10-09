import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, History, HeartHandshake, Eye, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const RecipientDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    );
  }

  const activeClaims = requests.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED');
  const pastClaims = requests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Recipient Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Browse fresh meals available in your zone and log requests</p>
        </div>
        <Link
          to="/recipient/browse"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <HeartHandshake size={15} /> Browse Food Items
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Requests</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><Clock size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{activeClaims.length}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Currently pending approval or pickup</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Fulfilled Meals</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><ClipboardCheck size={18} /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-4">
            {requests.filter((r) => r.status === 'COMPLETED').length}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">Total surplus claims successfully distributed</p>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-800">Your Active Claims</h3>
              <Link to="/recipient/requests" className="text-xs font-bold text-primary flex items-center gap-1">
                View History <History size={14} />
              </Link>
            </div>

            {activeClaims.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                You do not have any active food requests. Click "Browse Food Items" to claim food.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeClaims.map((r) => (
                  <div key={r.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{r.donation.foodName}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        From: {r.donation.donor.user.name} • Needed: {r.quantityNeeded}
                      </p>
                    </div>
                    <div>
                      {r.status === 'REJECTED' ? (
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-red-50 text-red-600">
                          Cancelled by Donor
                        </span>
                      ) : r.pickups?.some((p: any) => p.status === 'CANCELLED') ? (
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-orange-50 text-orange-600">
                          Cancelled by NGO
                        </span>
                      ) : (
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                          r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                          r.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {r.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informative Side Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6 space-y-4">
            <div className="p-3 bg-primary-light text-primary rounded-xl w-12 h-12 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-xs text-gray-800">How to claim food?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              When you submit a claim, the food item is held. Once approved by the donor, partner NGOs schedule a driving pickup from the donor's coordinates and transport the warm meals directly to your designated address location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RecipientDashboard;
