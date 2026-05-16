import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      assignedUser,
      assignedUserId: assignedUserIdFromBody,
      project: projectId,
    } = req.body;
    const assignedUserId = assignedUserIdFromBody || assignedUser;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId !== req.user._id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    if (!assignedUserId || !(await project.hasMember(assignedUserId))) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      priority,
      assignedUserId,
      projectId,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = await project.hasMember(req.user._id);
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [{ model: User, as: 'assignedUser', attributes: ['_id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (error) {
    console.error('getTasksByProject error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedUserId: req.user._id },
      include: [Project],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (error) {
    console.error('getMyTasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedUserId } = req.body;
    const task = await Task.findByPk(req.params.id, { include: [Project] });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = task.Project.adminId === req.user._id || req.user.role === 'ADMIN';
    const isAssigned = task.assignedUserId === req.user._id;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (isAdmin) {
      if (assignedUserId && !(await task.Project.hasMember(assignedUserId))) {
        return res.status(400).json({ message: 'Assigned user must be a project member' });
      }

      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.dueDate = dueDate !== undefined ? (dueDate || null) : task.dueDate;
      task.priority = priority || task.priority;
      task.assignedUserId = assignedUserId || task.assignedUserId;
    }

    task.status = status || task.status;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: [Project] });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.Project.adminId !== req.user._id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

const getStats = async (req, res) => {
  try {
    const user = await User.findByPk(req.user._id, {
      include: [{ model: Project, as: 'projects' }]
    });

    const projectIds = user?.projects.map(p => p._id) || [];

    const tasks = await Task.findAll({
      where: projectIds.length > 0 ? { projectId: { [Op.in]: projectIds } } : { projectId: null }
    });

    const stats = {
      totalTasks: tasks.length,
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: tasks.filter(t => t.status === 'Done').length,
      overdue: tasks.filter(t => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < new Date()).length,
      projectProgress: user?.projects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p._id);
        const doneTasks = projectTasks.filter(t => t.status === 'Done').length;
        return {
          name: p.title,
          progress: projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
        };
      }) || []
    };

    res.json(stats);
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

export {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  deleteTask,
  getStats,
};
