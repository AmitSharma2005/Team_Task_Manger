import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: false,
});

const repairProjectMembersTable = async () => {
  const [indexes] = await sequelize.query("PRAGMA index_list('ProjectMembers')");
  const hasColumnUniqueIndexes = indexes.some((index) => index.unique && index.origin === 'u');

  if (!hasColumnUniqueIndexes) {
    return;
  }

  console.log('Repairing ProjectMembers table constraints');
  await sequelize.query('PRAGMA foreign_keys = OFF');
  await sequelize.query('ALTER TABLE `ProjectMembers` RENAME TO `ProjectMembers_backup`');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`ProjectMembers\` (
      \`createdAt\` DATETIME NOT NULL,
      \`updatedAt\` DATETIME NOT NULL,
      \`ProjectId\` UUID NOT NULL REFERENCES \`Projects\` (\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      \`UserId\` UUID NOT NULL REFERENCES \`Users\` (\`_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      PRIMARY KEY (\`ProjectId\`, \`UserId\`)
    )
  `);
  await sequelize.query(`
    INSERT OR IGNORE INTO \`ProjectMembers\` (\`createdAt\`, \`updatedAt\`, \`ProjectId\`, \`UserId\`)
    SELECT \`createdAt\`, \`updatedAt\`, \`ProjectId\`, \`UserId\`
    FROM \`ProjectMembers_backup\`
  `);
  await sequelize.query('DROP TABLE `ProjectMembers_backup`');
  await sequelize.query('PRAGMA foreign_keys = ON');
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database Connected');
    
    // Sync all models — plain sync() creates tables if missing, won't alter existing ones
    // (SQLite doesn't support ALTER TABLE reliably, so alter:true causes ValidationError)
    await sequelize.sync();
    await repairProjectMembersTable();
    console.log('Database synced successfully');
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default sequelize;
