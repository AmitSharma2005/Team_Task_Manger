import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter,
  CheckCircle2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyTasks = async () => {
    try {
      const { data } = await API.get('/tasks'); // Fetches tasks for current user
      setTasks(data);
    } catch (error) {
      toast.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusUpdate = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
      await API.put(`/tasks/${taskId}`, { status: nextStatus });
      toast.success(`Task marked as ${nextStatus}`);
      fetchMyTasks();
    } catch (error) {
      toast.error('Error updating task');
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.Project?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Tasks</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Tasks assigned to you.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="input-field pl-12 py-3 w-64 text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`card border-l-8 ${
                task.priority === 'High' ? 'border-l-rose-500' : 
                task.priority === 'Medium' ? 'border-l-amber-500' : 'border-l-blue-500'
              } p-0 overflow-hidden group`}
            >
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Briefcase size={12} />
                      {task.Project?.title}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                      task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  
                  <h3 className={`text-xl font-black mb-2 transition-all ${task.status === 'Done' ? 'line-through text-slate-400 opacity-50' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-6 mt-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Calendar size={14} className="text-primary-500" />
                       Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock size={14} className="text-primary-500" />
                       Status: {task.status}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-8 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleStatusUpdate(task._id, task.status)}
                    className={`w-full py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      task.status === 'Done' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle2 size={32} strokeWidth={task.status === 'Done' ? 3 : 2} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {task.status === 'Done' ? 'Done' : 'Mark done'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
             <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mb-6 text-slate-400">
                <CheckSquare size={64} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No tasks</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">You do not have any assigned tasks.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Tasks;
