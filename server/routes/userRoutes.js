import express from 'express';
import {
  authUser,
  registerUser,
  googleLogin,
  getUserProfile,
  getUsers,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, admin, getUsers);
router.put('/:id/role', protect, admin, updateUserRole);

export default router;
