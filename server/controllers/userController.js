import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'MEMBER',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random password
        role: 'MEMBER',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: ['_id', 'name', 'email', 'role', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });

  res.json(users);
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (req.params.id === req.user._id) {
    return res.status(400).json({ message: 'You cannot change your own role' });
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = role;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export { authUser, registerUser, googleLogin, getUserProfile, getUsers, updateUserRole };
