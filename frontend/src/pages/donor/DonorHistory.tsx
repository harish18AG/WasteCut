import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const DonorHistory: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/donations?mine=true');
        setDonations(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
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
          onClick={() => navigate('/donor')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-800">Donation History Log</h3>
          <p className="text-[10px] text-gray-400 mt-1">Audit log of all surplus listings submitted by {user?.name || 'your account'}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Food Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">
                    No historical logs found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-850">{d.foodName}</td>
                    <td className="px-6 py-4 text-xs">{d.category.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-xs">{d.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        d.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' :
                        d.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                        d.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' :
                        d.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                        d.status === 'PICKED_UP' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {d.status}
                      </span>
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
export default DonorHistory;
