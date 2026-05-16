import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Search,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const projectsRes = await API.get('/projects');
      setProjects(projectsRes.data);

      const allMembers = [];
      const memberIds = new Set();

      if (user?.role === 'ADMIN') {
        const [usersRes, invitesResponses] = await Promise.all([
          API.get('/users'),
          Promise.all(projectsRes.data.map((project) => API.get(`/projects/invitations/${project._id}`))),
        ]);

        setMembers(usersRes.data.map((member) => ({ ...member, status: 'VERIFIED' })));
        setPendingInvites(invitesResponses.flatMap((res) => res.data));
        return;
      }

      projectsRes.data.forEach(project => {
        project.members.forEach(member => {
          if (!memberIds.has(member._id)) {
            memberIds.add(member._id);
            allMembers.push({ ...member, status: 'VERIFIED' });
          }
        });
      });

      setMembers(allMembers);
      setPendingInvites([]);
    } catch (error) {
      toast.error('Error fetching team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedProject) return toast.error('Please select a project');
    try {
      await API.post('/projects/invite', { email: inviteEmail, projectId: selectedProject });
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchData(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending invitation');
    }
  };

  // Filter both members and pending invites
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvites = pendingInvites.filter(i => 
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) && i.status === 'PENDING'
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {user?.role === 'ADMIN' ? 'Members' : 'Team'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            {user?.role === 'ADMIN'
              ? 'Manage all members and project invitations.'
              : 'View members from your allocated projects.'}
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center gap-2 group"
          >
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            Invite Member
          </button>
        )}
      </header>

      <div className="card border-0 p-0 overflow-hidden shadow-2xl bg-white/40 dark:bg-slate-900/40">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search team..."
              className="input-field pl-12 py-3 bg-white dark:bg-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-primary-500/10 rounded-2xl text-[10px] font-black text-primary-600 uppercase tracking-widest">
               {members.length} {user?.role === 'ADMIN' ? 'Users' : 'Team Members'}
             </div>
             {user?.role === 'ADMIN' && (
               <div className="px-4 py-2 bg-amber-500/10 rounded-2xl text-[10px] font-black text-amber-600 uppercase tracking-widest">
                 {pendingInvites.filter(i => i.status === 'PENDING').length} Pending Invites
               </div>
             )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Existing Members */}
              {filteredMembers.map((member) => (
                <tr key={member._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-lg font-black shadow-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{member.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest">
                      <Shield size={10} className="text-primary-500" />
                      {member.role}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                      <CheckCircle size={12} />
                      Active Member
                    </div>
                  </td>
                </tr>
              ))}

              {/* Pending Invites */}
              {user?.role === 'ADMIN' && filteredInvites.map((invite) => (
                <tr key={invite._id} className="bg-amber-500/5 group hover:bg-amber-500/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-lg font-black border-2 border-dashed border-slate-300 dark:border-slate-700">
                        ?
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-400 uppercase tracking-tighter italic">Awaiting User...</p>
                        <p className="text-xs text-slate-500 font-medium">{invite.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Undetermined</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                      <Clock size={12} className="animate-pulse" />
                      Pending Approval
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border-white/20"
          >
            <div className="w-14 h-14 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center mb-5">
               <Mail size={32} />
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">Invite Member</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">The invitation will appear on the user's dashboard.</p>
            <form className="space-y-6" onSubmit={handleInvite}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Colleague Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Target Project</label>
                <select
                  required
                  className="input-field appearance-none cursor-pointer"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Choose Project...</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Send Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Team;
