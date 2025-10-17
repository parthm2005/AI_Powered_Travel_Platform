import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Shield, Settings, LogOut, Bell, Search, Home, BarChart3, Users, FileText, X } from 'lucide-react';
import {auth, db,signInWithGoogle} from "../firebaseConfig"
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import FloatingChatBubble from "../components/floatingBubble";
import ChatBot from './Chatbot';

const AuthForm = ({
    currentView,
  setCurrentView,
  formData,
  errors,
  handleInputChange,
  handleEmailBlur,
  handleSubmit,
  loading,
  showPassword,
  setShowPassword,
  handleGoogleSignIn,
  handleForgotPassword,
  resetEmailSent,
}) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentView === 'login' ? 'Welcome Back' : 
               currentView === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {currentView === 'login' ? 'Sign in to your account to continue' : 
               currentView === 'signup' ? 'Join us and start your journey' :
               'Enter your email to receive a password reset link'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Success message for password reset */}
            {currentView === 'forgot-password' && resetEmailSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Reset link sent!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Check your email for a password reset link. If you don't see it, check your spam folder.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <div className="text-red-600 text-xs mt-2">{errors.name}</div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  onBlur={handleEmailBlur}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                />
              </div>
              {errors.email && (
                <div className="text-red-600 text-xs mt-2">{errors.email}</div>
              )}
            </div>

            {currentView !== 'forgot-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {currentView === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {errors.general && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {errors.password && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {errors.password}
              </div>
            )}

            <button
              onClick={currentView === 'forgot-password' ? handleForgotPassword : handleSubmit}
              disabled={loading || (currentView === 'forgot-password' && resetEmailSent)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                currentView === 'login' ? 'Sign In' : 
                currentView === 'signup' ? 'Create Account' : 
                resetEmailSent ? 'Email Sent' : 'Send Reset Link'
              )}
            </button>

            {/* Google Sign-In - Only show for login and signup */}
            {currentView !== 'forgot-password' && (
              <>
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="mx-4 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.13 2.7 30.45 0 24 0 14.98 0 6.93 5.48 2.69 13.44l7.98 6.21C12.36 13.13 17.77 9.5 24 9.5z"/>
                        <path fill="#34A853" d="M46.1 24.55c0-1.54-.14-3.02-.39-4.45H24v8.43h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.19 5.59C43.93 37.13 46.1 31.33 46.1 24.55z"/>
                        <path fill="#FBBC05" d="M10.67 28.65c-1.01-2.99-1.01-6.21 0-9.2l-7.98-6.21C.64 17.09 0 20.44 0 24c0 3.56.64 6.91 1.69 10.76l7.98-6.21z"/>
                        <path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.63-5.81l-7.19-5.59c-2.01 1.35-4.59 2.15-7.44 2.15-6.23 0-11.64-3.63-13.33-8.94l-7.98 6.21C6.93 42.52 14.98 48 24 48z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Navigation between forms */}
          <div className="mt-6 text-center space-y-2">
            {currentView === 'login' && (
              <>
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setCurrentView('signup')}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-gray-600">
                  Forgot your password?{' '}
                  <button
                    onClick={() => setCurrentView('forgot-password')}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Reset it here
                  </button>
                </p>
              </>
            )}
            
            {currentView === 'signup' && (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
            
            {currentView === 'forgot-password' && (
              <p className="text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );

const Dashboard = ({
  user,
  logout,
  avatarPreview,
  avatarFile,
  avatarLoading,
  avatarError,
  handleAvatarChange,
  handleAvatarSave,
  handleAvatarCancel
}) => {
  //   const [activeTab, setActiveTab] = useState('overview');

  //   const menuItems = [
  //     { id: 'overview', label: 'Overview', icon: Home },
  //     { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  //     { id: 'users', label: 'Users', icon: Users },
  //     { id: 'reports', label: 'Reports', icon: FileText },
  //     { id: 'settings', label: 'Settings', icon: Settings },
  //   ];

  //   const stats = [
  //     { label: 'Total Users', value: '12,849', change: '+12%', color: 'text-green-600' },
  //     { label: 'Active Sessions', value: '1,234', change: '+8%', color: 'text-blue-600' },
  //     { label: 'Revenue', value: '$45,678', change: '+23%', color: 'text-purple-600' },
  //     { label: 'Growth Rate', value: '89%', change: '+5%', color: 'text-orange-600' },
  //   ];

  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       {/* Top Navigation */}
  //       <nav className="bg-white border-b border-gray-200 px-6 py-4">
  //         <div className="flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <div className="flex items-center space-x-2">
  //               <Shield className="w-8 h-8 text-blue-600" />
  //               <span className="text-xl font-bold text-gray-900">Dashboard</span>
  //             </div>
  //           </div>

  //           <div className="flex items-center space-x-4">
  //             {/* Search */}
  //             <div className="relative">
  //               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
  //               <input
  //                 type="text"
  //                 placeholder="Search..."
  //                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
  //               />
  //             </div>

  //             {/* Notifications */}
  //             <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
  //               <Bell className="w-5 h-5" />
  //               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
  //             </button>

  //             {/* User Menu */}
  //             <div className="flex items-center space-x-3">
  //               <img
  //                 src={user?.avatar}
  //                 alt="Profile"
  //                 className="w-8 h-8 rounded-full"
  //               />
  //               <div className="hidden md:block">
  //                 <p className="text-sm font-medium text-gray-900">{user?.name}</p>
  //                 <p className="text-xs text-gray-500">{user?.email}</p>
  //               </div>
  //               <button
  //                 onClick={logout}
  //                 className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
  //                 title="Logout"
  //               >
  //                 <LogOut className="w-4 h-4" />
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </nav>

  //       <div className="flex">
  //         {/* Sidebar */}
  //         <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
  //           <div className="p-6">
  //             <nav className="space-y-2">
  //               {menuItems.map((item) => {
  //                 const Icon = item.icon;
  //                 return (
  //                   <button
  //                     key={item.id}
  //                     onClick={() => setActiveTab(item.id)}
  //                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
  //                       activeTab === item.id
  //                         ? 'bg-blue-50 text-blue-700 border border-blue-200'
  //                         : 'text-gray-700 hover:bg-gray-50'
  //                     }`}
  //                   >
  //                     <Icon className="w-5 h-5" />
  //                     <span className="font-medium">{item.label}</span>
  //                   </button>
  //                 );
  //               })}
  //             </nav>
  //           </div>

  //           {/* User Info Card */}
  //           {/* <div className="absolute bottom-6 left-6 right-6">
  //             <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
  //               <div className="flex items-center space-x-3 mb-3">
  //                 <img
  //                   src={user?.avatar}
  //                   alt="Profile"
  //                   className="w-10 h-10 rounded-full border-2 border-white"
  //                 />
  //                 <div>
  //                   <p className="font-semibold text-sm">{user?.name}</p>
  //                   <p className="text-blue-100 text-xs">{user?.email}</p>
  //                 </div>
  //               </div>
  //               <div className="text-xs text-blue-100">
  //                 <p>Member since: {user?.joinDate}</p>
  //                 <p>Last login: {user?.lastLogin}</p>
  //               </div>
  //             </div>
  //           </div> */}
  //         </aside>

  //         {/* Main Content */}
  //         <main className="flex-1 p-6">
  //           {activeTab === 'overview' && (
  //             <div>
  //               <div className="mb-8">
  //                 <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}! 👋</h1>
  //                 <p className="text-gray-600">Here's what's happening with your account today.</p>
  //               </div>

  //               {/* Stats Grid */}
  //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  //                 {stats.map((stat, index) => (
  //                   <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
  //                     <div className="flex items-center justify-between mb-4">
  //                       <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
  //                       <span className={`text-sm font-semibold ${stat.color}`}>{stat.change}</span>
  //                     </div>
  //                     <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
  //                   </div>
  //                 ))}
  //               </div>

  //               {/* Activity Feed */}
  //               <div className="bg-white rounded-xl border border-gray-200">
  //                 <div className="p-6 border-b border-gray-200">
  //                   <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
  //                 </div>
  //                 <div className="p-6">
  //                   <div className="space-y-4">
  //                     {[
  //                       { action: 'User logged in', time: '2 minutes ago', type: 'success' },
  //                       { action: 'Profile updated', time: '1 hour ago', type: 'info' },
  //                       { action: 'New message received', time: '3 hours ago', type: 'warning' },
  //                       { action: 'Password changed', time: '1 day ago', type: 'success' },
  //                     ].map((activity, index) => (
  //                       <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
  //                         <div className="flex items-center space-x-3">
  //                           <div className={`w-2 h-2 rounded-full ${
  //                             activity.type === 'success' ? 'bg-green-500' :
  //                             activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  //                           }`}></div>
  //                           <span className="text-gray-900">{activity.action}</span>
  //                         </div>
  //                         <span className="text-sm text-gray-500">{activity.time}</span>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {activeTab === 'settings' && (
  //             <div>
  //               <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
                
  //               <div className="bg-white rounded-xl border border-gray-200 p-6">
  //                 <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
  //                 <div className="space-y-6">
  //                   <div className="flex items-center space-x-6">
  //                     <img
  //                       src={user?.avatar}
  //                       alt="Profile"
  //                       className="w-20 h-20 rounded-full border-4 border-gray-100"
  //                     />
  //                     <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  //                       Change Avatar
  //                     </button>
  //                   </div>

  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                     <div>
  //                       <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
  //                       <input
  //                         type="text"
  //                         value={user?.name}
  //                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //                       />
  //                     </div>
  //                     <div>
  //                       <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
  //                       <input
  //                         type="email"
  //                         value={user?.email}
  //                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //                       />
  //                     </div>
  //                   </div>

  //                   <div className="flex space-x-4">
  //                     <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  //                       Save Changes
  //                     </button>
  //                     <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
  //                       Cancel
  //                     </button>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {['analytics', 'users', 'reports'].includes(activeTab) && (
  //             <div>
  //               <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{activeTab}</h1>
  //               <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
  //                 <div className="text-gray-400 mb-4">
  //                   <BarChart3 className="w-16 h-16 mx-auto" />
  //                 </div>
  //                 <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</h3>
  //                 <p className="text-gray-600">This section is under development and will be available in the next release.</p>
  //               </div>
  //             </div>
  //           )}
  //         </main>
  //       </div>
  //     </div>
  //   );
  // };
  const [activeTab, setActiveTab] = useState('overview');
  const [showChatbot, setShowChatbot] = useState(false); // State to control chatbot visibility
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Fetch dashboard statistics from API
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        // Convert the object to array format for mapping
        const statsArray = Object.values(result.data);
        setStats(statsArray);
      } else {
        console.error('Failed to fetch stats:', result.error);
        // Fallback to default stats
        setStats([
          { label: 'Total Users', value: '12,849', change: '+12%', color: 'text-green-600' },
          { label: 'Active Sessions', value: '1,234', change: '+8%', color: 'text-blue-600' },
          { label: 'Revenue', value: '$45,678', change: '+23%', color: 'text-purple-600' },
          { label: 'Growth Rate', value: '89%', change: '+5%', color: 'text-orange-600' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to default stats
      setStats([
        { label: 'Total Users', value: '12,849', change: '+12%', color: 'text-green-600' },
        { label: 'Active Sessions', value: '1,234', change: '+8%', color: 'text-blue-600' },
        { label: 'Revenue', value: '$45,678', change: '+23%', color: 'text-purple-600' },
        { label: 'Growth Rate', value: '89%', change: '+5%', color: 'text-orange-600' },
      ]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchDashboardStats();
    
    // Optional: Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to handle opening chatbot
  const handleOpenChatbot = () => {
    setShowChatbot(true);
  };

  // Function to handle closing chatbot
  const handleCloseChatbot = () => {
    setShowChatbot(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || user?.photoURL || 'https://via.placeholder.com/32x32?text=U'}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.displayName || user?.name || 'User'}! 👋</h1>
                <p className="text-gray-600">Here's what's happening with your account today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsLoading ? (
                  // Loading skeleton
                  Array(4).fill(0).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))
                ) : (
                  stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                        <span className={`text-sm font-semibold ${stat.color}`}>{stat.change}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { action: 'User logged in', time: '2 minutes ago', type: 'success' },
                      { action: 'Profile updated', time: '1 hour ago', type: 'info' },
                      { action: 'New message received', time: '3 hours ago', type: 'warning' },
                      { action: 'Password changed', time: '1 day ago', type: 'success' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'success' ? 'bg-green-500' :
                            activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-gray-900">{activity.action}</span>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={avatarPreview || user?.avatar || user?.photoURL || 'https://via.placeholder.com/80x80?text=Avatar'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-4 border-gray-100 object-cover"
                      />
                      {avatarLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center"
                      >
                        Choose New Avatar
                      </label>
                      {avatarPreview && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAvatarSave}
                            disabled={avatarLoading}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Save Avatar
                          </button>
                          <button
                            onClick={handleAvatarCancel}
                            disabled={avatarLoading}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {avatarError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {avatarError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user?.displayName || user?.name || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Avatar Upload Guidelines</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Recommended dimensions: 200x200 pixels or larger</li>
                      <li>• Square images work best for profile pictures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['analytics', 'users', 'reports'].includes(activeTab) && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{activeTab}</h1>
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <BarChart3 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</h3>
                <p className="text-gray-600">This section is under development and will be available in the next release.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Chat Bubble - Only show when chatbot is not open */}
      {!showChatbot && (
        <FloatingChatBubble onOpenChatbot={handleOpenChatbot} />
      )}

      {/* Chatbot Modal/Overlay */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleCloseChatbot}
              className="absolute top-4 right-4 z-10 flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 relative" />
            </button>
            
            {/* Chatbot Component */}
            <div className="h-full">
              <ChatBot onClose={handleCloseChatbot}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const AuthDashboard = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Avatar upload states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Load saved avatar on component mount
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    
    if (savedUserData && isAuthenticated) {
      try {
        const userData = JSON.parse(savedUserData);
        if (userData.avatar) {
          setUser(prev => ({ ...prev, avatar: userData.avatar, photoURL: userData.avatar }));
        }
      } catch (error) {
        console.error('Failed to load saved user data:', error);
      }
    }
  }, [isAuthenticated]);

  // Google Sign-In logic
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      const result = await signInWithGoogle();
      const googleUser = result.user;

      // Store user details in Firestore (if new user)
      await addDoc(collection(db, "userDetails"), {
        uid: googleUser.uid,
        name: googleUser.displayName || '',
        email: googleUser.email,
        avatar: googleUser.photoURL || '',
        provider: 'google',
        createdAt: new Date().toISOString()
      });

      // Check for saved avatar in localStorage
      const savedUserData = localStorage.getItem('userData');
      let userWithAvatar = googleUser;
      
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          if (userData.avatar && userData.email === googleUser.email) {
            userWithAvatar = { ...googleUser, avatar: userData.avatar, photoURL: userData.avatar };
          }
        } catch (error) {
          console.error('Failed to load saved avatar:', error);
        }
      }

      setUser(userWithAvatar);
      setIsAuthenticated(true);
      setErrors({});
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
      setErrors({ general: error.message });
    }
    setLoading(false);
  };


  const handleSignup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    // Store user details in Firestore
    await addDoc(collection(db, "userDetails"), {
      uid: userCredential.user.uid,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      createdAt: new Date().toISOString()
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    alert("Signup successful! Please check your email to verify your account.");
    setUser(userCredential.user);
    setIsAuthenticated(true);
    setErrors({});
  } catch (error) {
    console.error("Signup error:", error.message);
    setErrors({ general: error.message });
  }
};

  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    if (!userCredential.user.emailVerified) {
      alert("Please verify your email before logging in.");
      return;
    }

    // Successful login
    setUser(userCredential.user);
    setIsAuthenticated(true);
    setErrors({});
  } catch (error) {
    console.error("Login error:", error.message);
    if (error.message === "Firebase: Error (auth/invalid-credential).") {
      setErrors({ general: "Invalid email or password" });
    } else {
      setErrors({ general: error.message });
    }
  }
};

  // Forgot Password functionality
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ general: 'Please enter your email address' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors({ general: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setErrors({});
    } catch (error) {
      console.error("Password reset error:", error.message);
      if (error.code === 'auth/user-not-found') {
        setErrors({ general: 'No account found with this email address' });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ general: 'Invalid email address' });
      } else {
        setErrors({ general: 'Failed to send reset email. Please try again.' });
      }
    }
    
    setLoading(false);
  };// Mock authentication function
const authenticate = async (email, password, isSignup = false) => {
  setLoading(true);
  setErrors({});

  // Basic validation
  if (!email || !password) {
    setErrors({ general: 'Please fill in all fields' });
    setLoading(false);
    return;
  }

  if (isSignup && password !== formData.confirmPassword) {
    setErrors({ password: 'Passwords do not match' });
    setLoading(false);
    return;
  }

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  if (isSignup) {
    await handleSignup();
  } else {
    await handleLogin();
  }

  setLoading(false);
};

  // Email validation function
  const validateEmail = (email) => {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    // Check for empty full name during signup
    if (currentView === 'signup' && !formData.name) {
      setErrors((prev) => ({ ...prev, name: 'Please enter full name' }));
      return;
    }
    // Check for empty email
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required.' }));
      return;
    }
    // Check for invalid email
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }
    authenticate(formData.email, formData.password, currentView === 'signup');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Validate email only on blur
  const handleEmailBlur = (e) => {
    const value = e.target.value;
    if (!value) {
      setErrors((prev) => ({ ...prev, email: 'Email is required.' }));
    } else if (!validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setCurrentView('login');
    // Reset avatar states
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError('');
    // Reset forgot password state
    setResetEmailSent(false);
  };

  // Avatar upload functions
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarError('');
    
    if (!file) {
      setAvatarPreview(null);
      setAvatarFile(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setAvatarError('File size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) {
      setAvatarError('Please select an image first');
      return;
    }

    setAvatarLoading(true);
    setAvatarError('');

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAvatarUrl = event.target.result;
        
        // Update user object with new avatar
        const updatedUser = {
          ...user,
          avatar: newAvatarUrl,
          photoURL: newAvatarUrl // For compatibility with Google auth
        };
        
        setUser(updatedUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('userAvatar', newAvatarUrl);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Reset avatar upload states
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarLoading(false);
        
        alert('Avatar updated successfully!');
      };
      
      reader.onerror = () => {
        setAvatarError('Failed to process image. Please try again.');
        setAvatarLoading(false);
      };
      
      reader.readAsDataURL(avatarFile);
    } catch (error) {
      console.error('Avatar upload error:', error);
      setAvatarError('Failed to upload avatar. Please try again.');
      setAvatarLoading(false);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError('');
  };

  

  

//   return isAuthenticated ? <Dashboard /> : <AuthForm />;
return isAuthenticated ? (
  <Dashboard 
    user={user} 
    logout={logout}
    avatarPreview={avatarPreview}
    avatarFile={avatarFile}
    avatarLoading={avatarLoading}
    avatarError={avatarError}
    handleAvatarChange={handleAvatarChange}
    handleAvatarSave={handleAvatarSave}
    handleAvatarCancel={handleAvatarCancel}
  />
) : (
  <AuthForm
    currentView={currentView}
    setCurrentView={setCurrentView}
    formData={formData}
    errors={errors}
    handleInputChange={handleInputChange}
    handleEmailBlur={handleEmailBlur}
    handleSubmit={handleSubmit}
    loading={loading}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
    handleGoogleSignIn={handleGoogleSignIn}
    handleForgotPassword={handleForgotPassword}
    resetEmailSent={resetEmailSent}
  />
);

};

export default AuthDashboard;