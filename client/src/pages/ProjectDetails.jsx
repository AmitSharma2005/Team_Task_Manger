import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { 
  Plus, 
  ChevronRight,
  Clock,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { user } = useAuth();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedUserId: '',
  });

  const [inviteEmail, setInviteEmail] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Error fetching project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { ...newTask, project: id });
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium', assignedUserId: '' });
      fetchData();
    } catch (error) {
      toast.error('Error creating task');
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      await API.put(`/tasks/${draggableId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      toast.error('Error updating task status');
    }
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  if (loading) return <div className="p-8 text-center">Loading Project...</div>;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
             <span className="text-[10px] font-black uppercase tracking-widest">Projects</span>
             <ChevronRight size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">{project.title}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{project.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{project.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 mr-4">
            {project.members?.map((m, i) => (
              <div key={i} title={m.name} className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 bg-primary-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
          {user?.role === 'ADMIN' && (
            <>
              <button onClick={() => setShowInviteModal(true)} className="btn-secondary flex items-center gap-2 px-5 py-2.5">
                <UserPlus size={18} />
                Invite
              </button>
              <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                <Plus size={20} />
                Add Task
              </button>
            </>
          )}
        </div>
      </header>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[480px]">
          {['To Do', 'In Progress', 'Done'].map(status => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className="bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-3xl flex flex-col gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-primary-500' : 'bg-slate-400'}`}></div>
                      {status}
                    </h3>
                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400">
                      {getTasksByStatus(status).length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    {getTasksByStatus(status).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`card p-4 cursor-grab active:cursor-grabbing border-0 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-500/50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">{task.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-6">{task.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                <Clock size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black" title={task.assignedUser?.name}>
                                {task.assignedUser?.name?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl"
          >
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">New Task</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">Create a task and assign it to a team member.</p>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                required
                className="input-field"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Brief description..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  required
                  className="input-field"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <select
                  className="input-field"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign To</label>
                <select
                  required
                  className="input-field"
                  value={newTask.assignedUserId}
                  onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}
                >
                  <option value="">Select Member</option>
                  {project.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl"
          >
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">Invite Member</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">Invite someone to this project.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await API.post('/projects/invite', { email: inviteEmail, projectId: id });
                toast.success('Invitation sent!');
                setShowInviteModal(false);
                setInviteEmail('');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error sending invitation');
              }
            }} className="space-y-6">
              <input
                type="email"
                required
                className="input-field"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Send Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
