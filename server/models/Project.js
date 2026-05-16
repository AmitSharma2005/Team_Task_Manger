import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import ProjectMember from './ProjectMember.js';

const Project = sequelize.define('Project', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

// Relationships
Project.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });
Project.belongsToMany(User, {
  through: { model: ProjectMember, unique: false },
  as: 'members',
  foreignKey: 'ProjectId',
  otherKey: 'UserId',
});
User.belongsToMany(Project, {
  through: { model: ProjectMember, unique: false },
  as: 'projects',
  foreignKey: 'UserId',
  otherKey: 'ProjectId',
});

export default Project;
