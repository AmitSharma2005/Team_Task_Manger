import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Target,
  Mail,
  Check,
  X,
  Zap,
  Activity
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, inviteRes] = await Promise.all([
        API.get('/tasks/stats'),
        API.get('/projects/invitations')
      ]);
      setStats(statsRes.data);
      setInvitations(inviteRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvitation = async (invitationId, status) => {
    try {
      await API.post('/projects/invitations/respond', { invitationId, status });
      toast.success(`Invitation ${status === 'ACCEPTED' ? 'accepted' : 'rejected'}`);
      fetchData();
    } catch (error) {
      toast.error('Error responding to invitation');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center"
      >
        <div className="w-8 h-8 bg-primary-500 rounded-full animate-pulse"></div>
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tighter mb-2">Member Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Your allocated projects, tasks, and invitations.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
             <Activity size={24} />
           </div>
           <div className="pr-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
             <p className="text-sm font-black text-emerald-500">Online</p>
           </div>
        </div>
      </header>

      {/* Invitations Alert */}
      <AnimatePresence>
        {invitations.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            {invitations.map((invite) => (
              <div key={invite._id} className="card bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border-primary-500/30 flex items-center justify-between p-5">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-lg font-black shadow-xl">
                     {invite.sender.name.charAt(0)}
                   </div>
                    <div>
                     <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                       Project Invitation
                     </p>
                     <p className="text-xs text-slate-500 font-medium">From {invite.sender.name} to join <span className="text-primary-600 dark:text-primary-400 font-bold">{invite.Project.title}</span></p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <button 
                     onClick={() => handleInvitation(invite._id, 'ACCEPTED')}
                     className="p-4 bg-emerald-500 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
                   >
                     <Check size={20} />
                   </button>
                   <button 
                     onClick={() => handleInvitation(invite._id, 'REJECTED')}
                     className="p-4 bg-rose-500 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-rose-500/30"
                   >
                     <X size={20} />
                   </button>
                 </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total tasks', value: stats?.totalTasks, icon: <Zap />, color: 'from-blue-600 to-indigo-600', trend: 'All' },
          { title: 'Done', value: stats?.done, icon: <CheckCircle2 />, color: 'from-emerald-500 to-teal-600', trend: 'Complete' },
          { title: 'In progress', value: stats?.inProgress, icon: <Activity />, color: 'from-amber-500 to-orange-600', trend: 'Active' },
          { title: 'Overdue', value: stats?.overdue, icon: <AlertCircle />, color: 'from-rose-500 to-red-600', trend: 'Late' },
        ].map((item, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card group"
          >
            <div className="flex justify-between items-start mb-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400 dark:text-slate-500 tracking-widest">{item.trend}</span>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2">{item.title}</p>
            <p className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tighter">{item.value || 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1 flex flex-col items-center justify-center py-8">
          <header className="w-full flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Progress</h3>
            <Target className="text-primary-500" size={20} />
          </header>
          <div className="w-52 h-52 relative">
             <Doughnut 
               data={{
                 labels: ['Success', 'Pending'],
                 datasets: [{
                   data: [stats?.done || 0, (stats?.totalTasks - stats?.done) || 1],
                   backgroundColor: ['#8b5cf6', '#1e293b'],
                   borderWidth: 0,
                   cutout: '88%',
                   borderRadius: 30
                 }]
               }} 
               options={{ plugins: { legend: { display: false } } }} 
             />
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-[900] text-slate-900 dark:text-white tracking-tighter">
                  {stats?.totalTasks > 0 ? Math.round((stats.done / stats.totalTasks) * 100) : 0}%
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Done</p>
             </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Projects</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Progress by project.</p>
            </div>
            <BarChart3 size={24} className="text-primary-500" />
          </header>
          <div className="space-y-6">
            {stats?.projectProgress?.map((project, index) => (
              <div key={index} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                     <p className="font-black text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-widest">{project.name}</p>
                  </div>
                  <p className="text-xs font-black text-primary-500 bg-primary-500/10 px-3 py-1 rounded-lg">{project.progress}%</p>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
