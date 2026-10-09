import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const RecipientRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        setRequests(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/recipient')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-800">Your Requested Claims Log</h3>
          <p className="text-[10px] text-gray-400 mt-1">Audit log of all surplus claims submitted by your community account</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Food Item</th>
                <th className="px-6 py-3">Donor</th>
                <th className="px-6 py-3">Claim Quantity</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                    No requested claims logged yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{r.donation.foodName}</td>
                    <td className="px-6 py-4 text-xs">{r.donation.donor.user.name}</td>
                    <td className="px-6 py-4 text-xs font-medium">{r.quantityNeeded}</td>
                    <td className="px-6 py-4">
                      {r.status === 'REJECTED' ? (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-red-50 text-red-600">
                          Cancelled by Donor
                        </span>
                      ) : r.pickups?.some((p: any) => p.status === 'CANCELLED') ? (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-orange-50 text-orange-600">
                          Cancelled by NGO
                        </span>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                          r.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' :
                          r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default RecipientRequests;
