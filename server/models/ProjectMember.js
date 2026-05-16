import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
  ProjectId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  UserId: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
}, {
  tableName: 'ProjectMembers',
});

export default ProjectMember;
