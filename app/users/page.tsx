'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import { Sidebar } from '@/components';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Menu,
  Bell,
  Settings,
  ChevronDown,
  Download,
  UserPlus,
  X
} from 'lucide-react';

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check user role when session loads
  React.useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/v1/users/current');
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    
    checkUserRole();
  }, [session]);

  const {
    data: usersData,
    loading,
    error,
    updateFilters,
    createUser,
    updateUser,
    deleteUser
  } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: selectedFilter === 'all' ? '' : selectedFilter,
    role: selectedFilter === 'drivers' ? 'driver' : 
          selectedFilter === 'managers' ? 'manager' : 
          selectedFilter === 'dispatchers' ? 'dispatcher' : ''
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateFilters({
      page: 1,
      search: searchTerm,
      status: selectedFilter === 'all' ? '' : selectedFilter,
      role: selectedFilter === 'drivers' ? 'driver' : 
            selectedFilter === 'managers' ? 'manager' : 
            selectedFilter === 'dispatchers' ? 'dispatcher' : ''
    });
  };

  const handleSearchInputChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    updateFilters({
      page: 1,
      search: '',
      status: selectedFilter === 'all' ? '' : selectedFilter,
      role: selectedFilter === 'drivers' ? 'driver' : 
            selectedFilter === 'managers' ? 'manager' : 
            selectedFilter === 'dispatchers' ? 'dispatcher' : ''
    });
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    updateFilters({
      page: 1,
      search: searchTerm,
      status: filter === 'all' ? '' : filter,
      role: filter === 'drivers' ? 'driver' : 
            filter === 'managers' ? 'manager' : 
            filter === 'dispatchers' ? 'dispatcher' : ''
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateFilters({
      page,
      search: searchTerm,
      status: selectedFilter === 'all' ? '' : selectedFilter,
      role: selectedFilter === 'drivers' ? 'driver' : 
            selectedFilter === 'managers' ? 'manager' : 
            selectedFilter === 'dispatchers' ? 'dispatcher' : ''
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user? This will prevent them from signing in.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the users list
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to delete user'));
      }
    } catch (error) {
      alert('An unexpected error occurred');
      console.error('Error deleting user:', error);
    }
  };

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
    return phone;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sample mock users data for demonstration
  const users = usersData?.users || [];

  const filteredUsers = users;

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'dispatcher':
        return 'bg-orange-100 text-orange-800';
      case 'admin':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name ? 
                    session.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                    'U'
                  }
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              <p className="text-gray-600">Manage your logistics team members</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => router.push('/admin/add-user')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors border border-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    Search
                  </button>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="drivers">Drivers</option>
                  <option value="managers">Managers</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Hub</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Performance</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Join Date</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                            ) : (
                              getInitials(user.name || 'Unknown')
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{formatPhoneNumber(user.phone || '')}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1 text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{user.hubName || 'No Hub Assigned'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{user.totalDeliveries || 0} deliveries</p>
                          <p className="text-gray-500">⭐ {user.rating || 0}/5.0</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => router.push(`/users/${user._id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => router.push(`/users/${user._id}/edit`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" 
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{usersData?.stats.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usersData?.stats.active || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Drivers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {usersData?.stats.drivers || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {usersData?.stats.avgRating?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((usersData.pagination.currentPage - 1) * 10) + 1} to {Math.min(usersData.pagination.currentPage * 10, usersData.pagination.totalUsers)} of {usersData.pagination.totalUsers} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(usersData.pagination.currentPage - 1)}
                    disabled={!usersData.pagination.hasPrevPage}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                    {usersData.pagination.currentPage}
                  </span>
                  <button
                    onClick={() => handlePageChange(usersData.pagination.currentPage + 1)}
                    disabled={!usersData.pagination.hasNextPage}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
