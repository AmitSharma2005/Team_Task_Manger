import { sequelize, connectDB } from './config/db.js';
import User from './models/User.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if demo admin already exists
    let admin = await User.findOne({ where: { email: 'admin@ethara.com' } });
    
    if (!admin) {
      admin = await User.create({
        name: 'Demo Admin',
        email: 'admin@ethara.com',
        password: 'password123',
        role: 'ADMIN'
      });
      console.log('Demo Admin created successfully!');
    } else {
      console.log('Demo Admin already exists.');
    }
    
    console.log('--- DEMO CREDENTIALS ---');
    console.log('Email: admin@ethara.com');
    console.log('Password: password123');
    console.log('------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
