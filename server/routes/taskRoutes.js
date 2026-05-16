import express from 'express';
import {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  deleteTask,
  getStats,
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyTasks)
  .post(protect, admin, createTask);

router.get('/project/:projectId', protect, getTasksByProject);
router.get('/stats', protect, getStats);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

export default router;
