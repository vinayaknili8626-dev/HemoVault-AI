import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShieldAlert, CheckCircle, Ban, RefreshCw, UserCheck } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await axios.put(`/api/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
        alert(`Account status updated to ${nextStatus}`);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleApproval = async (userId, role, approve) => {
    try {
      const endpoint = role === 'doctor' 
        ? `/api/admin/doctors/${userId}/approve` 
        : `/api/admin/labs/${userId}/approve`;

      const res = await axios.put(endpoint, { approve });
      if (res.data.success) {
        alert(`Registration ${approve ? 'approved' : 'rejected'}`);
        // Reload users list to update state
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to execute approval action: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === 'All') return true;
    return u.role === filterRole;
  });

  const rolesList = ['All', 'patient', 'doctor', 'laboratory', 'hospital_admin', 'super_admin'];

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving system ledger records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">User Registry Management</h1>
        <p className="text-xs text-slate-500 mt-1">Suspend user access, approve medical registrations, and monitor roles</p>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {rolesList.map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 text-2xs font-bold rounded-xl transition-all border ${
              filterRole === role
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {role === 'All' ? 'All Roles' : role.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-850 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Identity Details</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registry Date</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{u.name}</h4>
                        <span className="text-[10px] text-slate-450 block mt-0.5">{u.email} | {u.phone || 'No Phone'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-3xs font-bold rounded uppercase ${
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Approve button for doctor/lab roles */}
                    {(u.role === 'doctor' || u.role === 'laboratory') && (
                      <>
                        <button
                          onClick={() => handleApproval(u._id, u.role, true)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-3xs font-bold rounded-lg border border-emerald-500/20 inline-flex items-center gap-1"
                          title="Grant Verified Medical Access"
                        >
                          <UserCheck size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproval(u._id, u.role, false)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-3xs font-bold rounded-lg border border-red-500/20 inline-flex items-center gap-1"
                          title="Reject Credentials Approval"
                        >
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    {/* Suspend Toggle */}
                    <button
                      onClick={() => handleStatusToggle(u._id, u.status)}
                      className={`px-3 py-1.5 text-3xs font-bold rounded-lg border inline-flex items-center gap-1 ${
                        u.status === 'active'
                          ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Ban size={12} />
                      <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
