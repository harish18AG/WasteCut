import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  Utensils,
  Leaf,
  Download,
  Trash2,
  Star,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = (() => {
    if (location.pathname.endsWith('/users')) return 'users';
    if (location.pathname.endsWith('/feedback')) return 'feedback';
    if (location.pathname.endsWith('/reports')) return 'reports';
    return 'overview';
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, feedbackRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/feedback'),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setFeedback(feedbackRes.data);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? All their profiles and history will be permanently deleted.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      fetchData(); // refresh counters
    } catch (e) {
      alert('Failed to delete user.');
    }
  };

  // Helper to trigger JSON reports download
  const handleExportData = (data: any, fileName: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${fileName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper to compile a premium analytics report and trigger browser print-to-PDF
  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>System Performance & Analytics Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body { 
              font-family: 'Outfit', sans-serif; 
              padding: 40px; 
              color: #1f2937; 
              background-color: #ffffff; 
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #16a34a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 26px;
              font-weight: 800;
              color: #111827;
              margin: 0;
            }
            .subtitle {
              font-size: 13px;
              color: #16a34a;
              margin-top: 5px;
              font-weight: 600;
            }
            .meta {
              font-size: 11px;
              color: #6b7280;
              text-align: right;
            }
            .stats-grid { 
              display: grid; 
              grid-template-cols: repeat(4, 1fr); 
              gap: 20px; 
              margin-bottom: 40px; 
            }
            .stat-card { 
              border: 1px solid #f3f4f6; 
              background-color: #f9fafb;
              padding: 16px; 
              border-radius: 16px; 
            }
            .stat-label {
              font-size: 10px; 
              color: #6b7280; 
              font-weight: 600; 
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .stat-val { 
              font-size: 22px; 
              font-weight: 800; 
              color: #16a34a; 
              margin-top: 8px; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: bold; 
              color: #111827;
              margin-top: 40px; 
              border-bottom: 2px solid #f3f4f6; 
              padding-bottom: 8px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
            }
            th, td { 
              padding: 12px 16px; 
              border-bottom: 1px solid #f3f4f6; 
              text-align: left; 
              font-size: 12px; 
            }
            th { 
              background-color: #f9fafb; 
              font-weight: 600; 
              color: #374151;
            }
            td {
              color: #4b5563;
            }
            .role-badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 9px;
              font-weight: bold;
              border-radius: 9999px;
              background-color: #e8f5e9;
              color: #2e7d32;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">🌱 WasteCut System Analytics</div>
              <div class="subtitle">Smart Food Waste Reduction & Redistribution System</div>
            </div>
            <div class="meta">
              <div>System Analytics & Performance Report</div>
              <div style="margin-top: 4px; font-weight: 600;">Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Food Saved</div>
              <div class="stat-val">${stats.foodSavedKg} kg</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Carbon Offset</div>
              <div class="stat-val">${stats.carbonFootprintSaved} kg</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Waste Reduction Rate</div>
              <div class="stat-val">${stats.wasteReductionRate}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Transactions</div>
              <div class="stat-val">${stats.totalDonations} listings</div>
            </div>
          </div>

          <div class="section-title">Active Platform Users Directory</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>System Role</th>
                <th>Contact Phone</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td style="font-weight: 600; color: #111827;">${u.name}</td>
                  <td>${u.email}</td>
                  <td><span class="role-badge">${u.role}</span></td>
                  <td>${u.phone || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Partner Testimonials & Feedback Reviews</div>
          <table>
            <thead>
              <tr>
                <th>Sender / Organization</th>
                <th>Role</th>
                <th>Rating</th>
                <th>Feedback comments</th>
              </tr>
            </thead>
            <tbody>
              ${feedback.map(f => `
                <tr>
                  <td style="font-weight: 600; color: #111827;">${f.sender.name}</td>
                  <td>${f.sender.role}</td>
                  <td style="color: #d97706; font-weight: 600;">${f.rating} / 5 ★</td>
                  <td>"${f.comments}"</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 shimmer rounded-2xl" />
          <div className="h-80 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  const { stats, charts } = analytics || {
    stats: { activeDonors: 0, activeNgos: 0, activeRecipients: 0, totalDonations: 0, completedPickups: 0, foodSavedKg: 0, carbonFootprintSaved: 0, wasteReductionRate: 0 },
    charts: { userGrowth: [], dailyDonations: [], monthlyDonations: [], foodSavedTrend: [] }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Subheader */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time statistics covering surplus listings, NGO schedules, and greenhouse mitigation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportData(analytics, 'wastecut-analytics')}
            className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl bg-white hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-primary/10"
          >
            <Download size={14} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        {(['overview', 'users', 'feedback', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => navigate(tab === 'overview' ? '/admin' : `/admin/${tab}`)}
            className={`pb-3 text-sm font-semibold border-b-2 capitalize transition-all ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'reports' ? 'Reports & Analytics' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Food Saved</span>
                <div className="p-2 rounded-lg bg-green-50 text-green-600"><Utensils size={18} /></div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{stats.foodSavedKg} kg</h3>
              <p className="text-[10px] text-gray-400 mt-1">Cumulative weight of delivered dishes</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Carbon Offset</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Leaf size={18} /></div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{stats.carbonFootprintSaved} kg</h3>
              <p className="text-[10px] text-gray-400 mt-1">Avoided greenhouse gas emissions</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Waste Reduction</span>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><TrendingUp size={18} /></div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-4">{stats.wasteReductionRate}%</h3>
              <p className="text-[10px] text-gray-400 mt-1">Delivered listings vs total posted</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Active Entities</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Users size={18} /></div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-4">
                {stats.activeDonors + stats.activeNgos}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                {stats.activeDonors} Donors • {stats.activeNgos} NGOs
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <h4 className="font-bold text-sm text-gray-800 mb-6">Donation Volume Trends</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.dailyDonations && charts.dailyDonations.length > 0 ? charts.dailyDonations : [{ name: 'Aug', donations: stats.totalDonations }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" />
                    <Tooltip />
                    <Area type="monotone" dataKey="donations" stroke="#16a34a" fillOpacity={0.1} fill="#16a34a" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <h4 className="font-bold text-sm text-gray-800 mb-6">Cumulative Food Rescued</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.foodSavedTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="saved" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-800">User Directory</h3>
            <button
              onClick={() => handleExportData(users, 'wastecut-users')}
              className="text-xs text-primary font-semibold hover:text-primary-dark"
            >
              Export Accounts
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 font-semibold text-gray-800">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                        u.role === 'DONOR' ? 'bg-green-50 text-green-600' :
                        u.role === 'NGO' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Partner Testimonials & Feedback</h3>
            <div className="divide-y divide-gray-100">
              {feedback.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No feedback reviews submitted yet.
                </div>
              ) : (
                feedback.map((f) => (
                  <div key={f.id} className="py-6 flex gap-4 first:pt-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {f.sender.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-gray-800">{f.sender.name}</h5>
                        <span className="text-[9px] text-gray-400">({f.sender.role})</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < f.rating ? 'currentColor' : 'transparent'}
                            className={i < f.rating ? 'text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {f.comments}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-gray-800">Generate Performance Analysis Report</h3>
              <p className="text-xs text-gray-400 mt-1">Download real-time metrics, user activities, and partner feedback formatted as a clean PDF document.</p>
            </div>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <Download size={14} /> Download PDF Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <h4 className="font-bold text-sm text-gray-800 mb-6">Donation Volume Trends</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.dailyDonations && charts.dailyDonations.length > 0 ? charts.dailyDonations : [{ name: 'Aug', donations: stats.totalDonations }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" />
                    <Tooltip />
                    <Area type="monotone" dataKey="donations" stroke="#16a34a" fillOpacity={0.1} fill="#16a34a" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
              <h4 className="font-bold text-sm text-gray-800 mb-6">Cumulative Food Rescued</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.foodSavedTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="saved" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
