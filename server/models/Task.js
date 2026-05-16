import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Project from './Project.js';

const Task = sequelize.define('Task', {
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
  dueDate: {
    type: DataTypes.DATE,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Done'),
    defaultValue: 'To Do',
  },
});

// Relationships
Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(Task, { foreignKey: 'projectId' });

Task.belongsTo(User, { as: 'assignedUser', foreignKey: 'assignedUserId' });

export default Task;
