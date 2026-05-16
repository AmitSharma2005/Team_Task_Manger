import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Plus, 
  Search, 
  Briefcase, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', newProject);
      toast.success('Project created successfully!');
      setShowModal(false);
      setNewProject({ title: '', description: '' });
      fetchProjects();
    } catch (error) {
      toast.error('Error creating project');
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Projects</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Manage your team projects.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="input-field pl-10 py-2.5 w-64 text-sm"
            />
          </div>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Project
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {projects.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link to={`/projects/${project._id}`} className="block group">
                <div className="card h-full flex flex-col group-hover:border-primary-500/50 group-hover:ring-4 group-hover:ring-primary-500/5 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      <Briefcase size={24} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {project.members?.slice(0, 3).map((member, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-primary-500 font-bold text-sm">
                      View Details
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
             <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mb-4 text-slate-400">
                <Briefcase size={48} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects yet</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 text-sm">Ready to start something new? Create your first project to begin tracking tasks.</p>
             {user?.role === 'ADMIN' && (
               <button onClick={() => setShowModal(true)} className="btn-primary">Create First Project</button>
             )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative"
          >
            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">New Project</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Add the project details.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Website Redesign"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">Description</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Describe the scope and objectives..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Project</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
