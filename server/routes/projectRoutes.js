import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  sendInvitation,
  getMyInvitations,
  respondToInvitation,
  getProjectInvitations,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, admin, createProject);

router.get('/invitations', protect, getMyInvitations);
router.post('/invitations/respond', protect, respondToInvitation);
router.post('/invite', protect, admin, sendInvitation);
router.get('/invitations/:projectId', protect, getProjectInvitations);

router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, admin, deleteProject);

export default router;
