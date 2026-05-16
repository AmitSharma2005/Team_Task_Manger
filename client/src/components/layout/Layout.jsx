import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Grid2X2, 
  Layers, 
  ListTodo, 
  Users2, 
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <Grid2X2 size={22} />, path: '/' },
    { name: 'Projects', icon: <Layers size={22} />, path: '/projects' },
    { name: 'Tasks', icon: <ListTodo size={22} />, path: '/tasks' },
    { name: user?.role === 'ADMIN' ? 'Members' : 'Team', icon: <Users2 size={22} />, path: '/team' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] text-slate-900 transition-colors duration-300 font-sans p-3 lg:p-4 gap-4">
      <aside className="w-60 hidden lg:flex flex-col z-30 premium-glass rounded-3xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-[800] tracking-tighter text-slate-900 leading-none">
              Ethara
            </h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Task Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-4">Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-link group ${location.pathname === item.path ? 'sidebar-link-active' : ''}`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${location.pathname === item.path ? 'bg-white/20' : 'group-hover:bg-primary-500/10'}`}>
                {item.icon}
              </div>
              <span className="text-sm tracking-tight">{item.name}</span>
              {location.pathname === item.path && (
                <motion.div layoutId="active" className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-lg" />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 group cursor-pointer hover:bg-white transition-all duration-300">
             <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-teal-500/15">
               {user?.name?.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
               </div>
             </div>
             <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center gap-2 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">App</span>
             <ChevronRight size={12} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">{location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 premium-glass rounded-2xl text-slate-500 relative">
                 <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-white"></div>
                 <Users2 size={20} />
              </div>
           </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1 sm:px-2">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
