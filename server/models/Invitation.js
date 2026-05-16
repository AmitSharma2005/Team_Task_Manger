import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Project from './Project.js';

const Invitation = sequelize.define('Invitation', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
});

// Relationships
Invitation.belongsTo(Project, { foreignKey: 'projectId' });
Invitation.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

export default Invitation;
