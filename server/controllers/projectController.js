import Project from '../models/Project.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';

const createProject = async (req, res) => {
  const { title, description } = req.body;
  const project = await Project.create({
    title,
    description,
    adminId: req.user._id,
  });
  await project.addMember(req.user._id);
  res.status(201).json(project);
};

const getProjects = async (req, res) => {
  const user = await User.findByPk(req.user._id, {
    include: [{
      model: Project,
      as: 'projects',
      include: [
        { model: User, as: 'admin', attributes: ['_id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['_id', 'name', 'email'] }
      ]
    }]
  });
  res.json(user?.projects || []);
};

const getProjectById = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      { model: User, as: 'admin', attributes: ['_id', 'name', 'email'] },
      { model: User, as: 'members', attributes: ['_id', 'name', 'email'] }
    ]
  });

  if (project) {
    const isMember = await project.hasMember(req.user._id);
    if (isMember) {
      res.json(project);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

const sendInvitation = async (req, res) => {
  const { email, projectId } = req.body;
  const project = await Project.findByPk(projectId);

  if (!project || project.adminId !== req.user._id) {
    return res.status(403).json({ message: 'Only project admin can invite members' });
  }

  // Check if already a member
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser && (await project.hasMember(existingUser._id))) {
    return res.status(400).json({ message: 'User is already a member' });
  }

  // Check if invitation already exists
  const existingInvite = await Invitation.findOne({ where: { email, projectId, status: 'PENDING' } });
  if (existingInvite) {
    return res.status(400).json({ message: 'Invitation already sent' });
  }

  const invitation = await Invitation.create({
    email,
    projectId,
    senderId: req.user._id,
    status: 'PENDING'
  });

  res.status(201).json(invitation);
};

const getMyInvitations = async (req, res) => {
  const invitations = await Invitation.findAll({
    where: { email: req.user.email, status: 'PENDING' },
    include: [
      { model: Project, attributes: ['title'] },
      { model: User, as: 'sender', attributes: ['name'] }
    ]
  });
  res.json(invitations);
};

const respondToInvitation = async (req, res) => {
  const { invitationId, status } = req.body; // status: ACCEPTED or REJECTED
  const invitation = await Invitation.findByPk(invitationId);

  if (!invitation || invitation.email !== req.user.email) {
    return res.status(404).json({ message: 'Invitation not found' });
  }

  invitation.status = status;
  await invitation.save();

  if (status === 'ACCEPTED') {
    const project = await Project.findByPk(invitation.projectId);
    await project.addMember(req.user._id);
  }

  res.json({ message: `Invitation ${status.toLowerCase()}` });
};

const getProjectInvitations = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.adminId !== req.user._id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only admins can view project invitations' });
  }

  const invitations = await Invitation.findAll({
    where: { projectId: req.params.projectId },
    include: [
      { model: User, as: 'sender', attributes: ['name'] }
    ]
  });
  res.json(invitations);
};

const deleteProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (project && project.adminId === req.user._id) {
    await project.destroy();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

export {
  createProject,
  getProjects,
  getProjectById,
  sendInvitation,
  getMyInvitations,
  respondToInvitation,
  getProjectInvitations,
  deleteProject,
};
