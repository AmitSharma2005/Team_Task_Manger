import Project from '../models/Project.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      adminId: req.user._id,
    });
    await project.addMember(req.user._id);
    res.status(201).json(project);
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

const getProjects = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('getProjectById error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

const sendInvitation = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('sendInvitation error:', error);
    res.status(500).json({ message: 'Server error sending invitation' });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: { email: req.user.email, status: 'PENDING' },
      include: [
        { model: Project, attributes: ['title'] },
        { model: User, as: 'sender', attributes: ['name'] }
      ]
    });
    res.json(invitations);
  } catch (error) {
    console.error('getMyInvitations error:', error);
    res.status(500).json({ message: 'Server error fetching invitations' });
  }
};

const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, status } = req.body;
    const invitation = await Invitation.findByPk(invitationId);

    if (!invitation || invitation.email !== req.user.email) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'ACCEPTED') {
      const project = await Project.findByPk(invitation.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project no longer exists' });
      }
      await project.addMember(req.user._id);
    }

    res.json({ message: `Invitation ${status.toLowerCase()}` });
  } catch (error) {
    console.error('respondToInvitation error:', error);
    res.status(500).json({ message: 'Server error responding to invitation' });
  }
};

const getProjectInvitations = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('getProjectInvitations error:', error);
    res.status(500).json({ message: 'Server error fetching project invitations' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (project && project.adminId === req.user._id) {
      await project.destroy();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found or not authorized' });
    }
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
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
