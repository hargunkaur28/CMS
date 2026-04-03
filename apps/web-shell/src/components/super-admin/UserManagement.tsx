'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Activity,
  Lock,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { fetchStudents } from '@/lib/api/admin';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  isActive: boolean;
  collegeId?: {
    name: string;
    code: string;
  };
  authentication: {
    last_login?: string;
    login_count: number;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPayload, setImportPayload] = useState('');
  const [importing, setImporting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COLLEGE_ADMIN',
    phone: '',
    collegeId: '',
    studentIds: [] as string[],
    relation: 'Guardian',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'COLLEGE_ADMIN',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, page]);

  useEffect(() => {
    void loadLookupData();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '10');

      const response = await api.get(`/super-admin/users?${params}`);
      setUsers(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const loadLookupData = async () => {
    try {
      const [collegeRes, studentRes] = await Promise.all([
        api.get('/super-admin/colleges?limit=1000'),
        fetchStudents({ page: 1, limit: 1000 }),
      ]);

      setColleges(Array.isArray(collegeRes.data?.data) ? collegeRes.data.data : []);
      setAvailableStudents(Array.isArray(studentRes.data) ? studentRes.data : (Array.isArray(studentRes?.data?.data) ? studentRes.data.data : []));
    } catch (err) {
      console.error('Failed to load user creation lookups', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      };

      if (['STUDENT', 'TEACHER'].includes(formData.role)) {
        payload.collegeId = formData.collegeId;
      }

      if (formData.role === 'PARENT') {
        payload.studentIds = formData.studentIds;
        payload.relation = formData.relation;
      }

      await api.post('/super-admin/users', payload);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'COLLEGE_ADMIN',
        phone: '',
        collegeId: '',
        studentIds: [],
        relation: 'Guardian',
      });
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/super-admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await api.get(`/super-admin/users/${userId}`);
      setViewUser(response.data.data);
      setShowViewModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    }
  };

  const handleExportUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/super-admin/users/export/csv?${params}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export users');
    }
  };

  const handleBulkImportUsers = async () => {
    try {
      setImporting(true);
      const parsed = JSON.parse(importPayload);
      if (!Array.isArray(parsed)) {
        throw new Error('Import payload must be a JSON array');
      }

      const response = await api.post('/super-admin/users/bulk-import', { users: parsed });
      const summary = response.data?.data;
      window.alert(`Import complete: ${summary.created} created, ${summary.skipped} skipped`);
      setShowImportModal(false);
      setImportPayload('');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to import users');
    } finally {
      setImporting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUserId(user._id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await api.put(`/super-admin/users/${selectedUserId}`, editFormData);
      setShowEditModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = window.prompt('Enter a new password (minimum 6 characters):');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.post(`/super-admin/users/${userId}/reset-password`, { newPassword });
      setError(null);
      window.alert('Password reset successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-800',
      COLLEGE_ADMIN: 'bg-purple-100 text-purple-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
      PARENT: 'bg-yellow-100 text-yellow-800'
    };
    return badges[role] || '';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Upload size={18} /> Bulk Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COLLEGE_ADMIN">College Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="PARENT">Parent</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">College</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.collegeId?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(user.isActive)}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleViewUser(user._id)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user._id)}
                      className="p-2 hover:bg-orange-100 text-orange-600 rounded-lg transition"
                      title="Reset Password"
                    >
                      <Lock size={18} />
                    </button>
                    <button onClick={() => handleDeleteUser(user._id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No users found. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, collegeId: '', studentIds: [], relation: 'Guardian' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="COLLEGE_ADMIN">College Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
              </select>
              {['STUDENT', 'TEACHER'].includes(formData.role) && (
                <select
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college._id} value={college._id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>
              )}
              {formData.role === 'PARENT' && (
                <>
                  <select
                    multiple
                    value={formData.studentIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                      setFormData({ ...formData, studentIds: selected });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-40"
                    required
                  >
                    {availableStudents.map((student) => {
                      const label = `${student?.personalInfo?.firstName || ''} ${student?.personalInfo?.lastName || ''}`.trim() || student?.personalInfo?.email || student?.uniqueStudentId || 'Student';
                      return (
                        <option key={student._id} value={student._id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as User['role'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="COLLEGE_ADMIN">College Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active User</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUserId(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Details</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">Name:</span> {viewUser.name}</p>
              <p><span className="font-semibold">Email:</span> {viewUser.email}</p>
              <p><span className="font-semibold">Role:</span> {viewUser.role.replace('_', ' ')}</p>
              <p><span className="font-semibold">Status:</span> {viewUser.isActive ? 'Active' : 'Inactive'}</p>
              <p><span className="font-semibold">College:</span> {viewUser.collegeId?.name || 'N/A'}</p>
              <p><span className="font-semibold">Login Count:</span> {viewUser.authentication?.login_count ?? 0}</p>
              <p><span className="font-semibold">Last Login:</span> {viewUser.authentication?.last_login ? new Date(viewUser.authentication.last_login).toLocaleString('en-IN') : 'N/A'}</p>
            </div>
            <div className="pt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewUser(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Import Users (JSON)</h2>
            <p className="text-sm text-gray-600 mb-3">Paste a JSON array. Required fields per item: name, email. Optional: role, password, phone, collegeId.</p>
            <textarea
              rows={12}
              value={importPayload}
              onChange={(e) => setImportPayload(e.target.value)}
              placeholder='[{"name":"John Doe","email":"john@example.com","role":"STUDENT"}]'
              className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBulkImportUsers}
                disabled={importing}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
