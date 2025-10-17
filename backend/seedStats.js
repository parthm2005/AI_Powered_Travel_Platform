import mongoose from 'mongoose';
import DashboardStats from './src/models/dashboardModel.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDashboardStats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/travel_companion");
    console.log('Connected to MongoDB');

    // Clear existing stats
    await DashboardStats.deleteMany({});

    // Create initial dashboard stats
    const initialStats = new DashboardStats({
      totalUsers: 15847,
      activeSessions: 2156,
      revenue: 78392,
      growthRate: 92,
      lastUpdated: new Date()
    });

    await initialStats.save();
    console.log('Dashboard stats seeded successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding dashboard stats:', error);
    process.exit(1);
  }
};

seedDashboardStats();