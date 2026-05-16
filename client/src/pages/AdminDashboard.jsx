import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { Activity, CheckCircle2, FolderKanban, Shield, Users, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes, statsRes] = await Promise.all([
        API.get('/users'),
        API.get('/projects'),
        API.get('/tasks/stats'),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Error loading admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const counts = useMemo(() => ({
    admins: users.filter((item) => item.role === 'ADMIN').length,
    members: users.filter((item) => item.role === 'MEMBER').length,
  }), [users]);

  const handleRoleChange = async (memberId, role) => {
    setSavingUserId(memberId);
    try {
      const { data } = await API.put(`/users/${memberId}/role`, { role });
      setUsers((current) => current.map((item) => (
        item._id === memberId ? { ...item, role: data.role } : item
      )));
      toast.success('Role updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating role');
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Manage members, roles, projects, and team access.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-300 font-black text-xs uppercase tracking-widest">
          <Shield size={16} />
          Admin
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'All members', value: users.length, icon: <Users size={22} />, color: 'from-blue-600 to-indigo-600' },
          { label: 'Admins', value: counts.admins, icon: <Shield size={22} />, color: 'from-violet-600 to-purple-600' },
          { label: 'Members', value: counts.members, icon: <UserCog size={22} />, color: 'from-emerald-500 to-teal-600' },
          { label: 'My projects', value: projects.length, icon: <FolderKanban size={22} />, color: 'from-amber-500 to-orange-600' },
        ].map((item) => (
          <div key={item.label} className="card">
            <div className="flex items-start justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-xl`}>
                {item.icon}
              </div>
              <Activity size={18} className="text-slate-300" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
            <p className="text-3xl font-[900] text-slate-900 dark:text-white">{item.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="card xl:col-span-2 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Member Management</h3>
            <p className="text-xs text-slate-500 mt-1">Change roles for users across the app.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                          {member._id === user?._id && <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">You</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{member.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={member.role}
                        disabled={member._id === user?._id || savingUserId === member._id}
                        onChange={(event) => handleRoleChange(member._id, event.target.value)}
                        className="input-field py-2 text-xs font-black uppercase tracking-widest disabled:opacity-60"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Task Summary</h3>
          <p className="text-xs text-slate-500 mb-6">Stats from projects assigned to you.</p>
          <div className="space-y-4">
            {[
              { label: 'Total tasks', value: stats?.totalTasks },
              { label: 'Done', value: stats?.done },
              { label: 'In progress', value: stats?.inProgress },
              { label: 'Overdue', value: stats?.overdue },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{item.value || 0}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
