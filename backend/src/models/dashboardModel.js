import mongoose from 'mongoose';

const dashboardStatsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
    default: 0
  },
  activeSessions: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  growthRate: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);

export default DashboardStats;