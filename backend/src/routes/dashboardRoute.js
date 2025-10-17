import express from 'express';
import DashboardStats from '../models/dashboardModel.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    let stats = await DashboardStats.findOne().sort({ lastUpdated: -1 });
    
    // If no stats exist, create default ones
    if (!stats) {
      stats = new DashboardStats({
        totalUsers: 12849,
        activeSessions: 1234,
        revenue: 45678,
        growthRate: 89
      });
      await stats.save();
    }

    // Calculate percentage changes (you can customize this logic)
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const formattedStats = {
      totalUsers: {
        label: 'Total Users',
        value: stats.totalUsers.toLocaleString(),
        change: '+12%',
        color: 'text-green-600'
      },
      activeSessions: {
        label: 'Active Sessions',
        value: stats.activeSessions.toLocaleString(),
        change: '+8%',
        color: 'text-blue-600'
      },
      revenue: {
        label: 'Revenue',
        value: `$${stats.revenue.toLocaleString()}`,
        change: '+23%',
        color: 'text-purple-600'
      },
      growthRate: {
        label: 'Growth Rate',
        value: `${stats.growthRate}%`,
        change: '+5%',
        color: 'text-orange-600'
      }
    };

    res.json({
      success: true,
      data: formattedStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Update dashboard statistics (admin only)
router.put('/stats', async (req, res) => {
  try {
    const { totalUsers, activeSessions, revenue, growthRate } = req.body;

    let stats = await DashboardStats.findOne().sort({ lastUpdated: -1 });
    
    if (stats) {
      stats.totalUsers = totalUsers || stats.totalUsers;
      stats.activeSessions = activeSessions || stats.activeSessions;
      stats.revenue = revenue || stats.revenue;
      stats.growthRate = growthRate || stats.growthRate;
      stats.lastUpdated = new Date();
    } else {
      stats = new DashboardStats({
        totalUsers,
        activeSessions,
        revenue,
        growthRate
      });
    }

    await stats.save();

    res.json({
      success: true,
      message: 'Dashboard statistics updated successfully',
      data: stats
    });

  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dashboard statistics'
    });
  }
});

// Get real-time stats (calculate from actual data)
router.get('/stats/realtime', async (req, res) => {
  try {
    // Import your User model here
    // const User = await import('../models/userModel.js');
    
    // Calculate real stats from your database
    // const totalUsers = await User.countDocuments();
    // const activeSessions = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    
    // For now, return sample calculated data
    const realTimeStats = {
      totalUsers: {
        label: 'Total Users',
        value: '12,849', // Replace with: totalUsers.toLocaleString()
        change: '+12%',
        color: 'text-green-600'
      },
      activeSessions: {
        label: 'Active Sessions',
        value: '1,234', // Replace with: activeSessions.toLocaleString()
        change: '+8%',
        color: 'text-blue-600'
      },
      revenue: {
        label: 'Revenue',
        value: '$45,678',
        change: '+23%',
        color: 'text-purple-600'
      },
      growthRate: {
        label: 'Growth Rate',
        value: '89%',
        change: '+5%',
        color: 'text-orange-600'
      }
    };

    res.json({
      success: true,
      data: realTimeStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Real-time stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time statistics'
    });
  }
});

export default router;