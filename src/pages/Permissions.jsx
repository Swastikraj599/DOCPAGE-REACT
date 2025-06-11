import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Permissions = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasPermission('manage_permissions')) {
      loadRoles();
      loadPermissions();
    }
  }, [hasPermission]);

  const loadRoles = async () => {
    try {
      const rolesData = await apiService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      Swal.fire('Error', 'Failed to load roles', 'error');
    }
  };

  const loadPermissions = async () => {
    try {
      const permissionsData = await apiService.getPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading permissions:', error);
      Swal.fire('Error', 'Failed to load permissions', 'error');
    }
  };

  const loadRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const rolePermsData = await apiService.getRolePermissions(roleId);
      setRolePermissions(rolePermsData);
    } catch (error) {
      console.error('Error loading role permissions:', error);
      Swal.fire('Error', 'Failed to load role permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    loadRolePermissions(role.id);
  };

  const handlePermissionToggle = async (permission, isGranted) => {
    if (!hasPermission('manage_permissions')) {
      Swal.fire('Access Denied', 'You do not have permission to manage permissions', 'error');
      return;
    }

    try {
      if (isGranted) {
        await apiService.revokePermission(selectedRole.id, permission.id);
      } else {
        await apiService.grantPermission(selectedRole.id, permission.id);
      }
      
      // Reload role permissions
      await loadRolePermissions(selectedRole.id);
      
      Swal.fire(
        'Success!', 
        `Permission ${isGranted ? 'revoked' : 'granted'} successfully!`, 
        'success'
      );
    } catch (error) {
      console.error('Error toggling permission:', error);
      Swal.fire('Error', error.message || 'Failed to update permission', 'error');
    }
  };

  if (!hasPermission('manage_permissions')) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You do not have permission to manage permissions.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Permissions Management</h1>
            <p className="text-gray-300">Manage role-based permissions for the document management system</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <div className="bg-gray-800 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Roles</h2>
              </div>
              <div className="p-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm opacity-75">{role.description}</div>
                    <div className="text-xs mt-1">
                      {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {selectedRole ? `Permissions for ${selectedRole.name}` : 'Select a role to manage permissions'}
                </h2>
              </div>
              <div className="p-4">
                {selectedRole ? (
                  loading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400">Loading permissions...</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Group permissions by resource */}
                      {Object.entries(
                        rolePermissions.reduce((groups, perm) => {
                          const resource = perm.resource;
                          if (!groups[resource]) groups[resource] = [];
                          groups[resource].push(perm);
                          return groups;
                        }, {})
                      ).map(([resource, perms]) => (
                        <div key={resource} className="bg-gray-700 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-white mb-3 capitalize">
                            {resource} Permissions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 bg-gray-600 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-white">{permission.name}</div>
                                  <div className="text-sm text-gray-300">{permission.description}</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Action: {permission.action}
                                  </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                  <input
                                    type="checkbox"
                                    checked={permission.granted}
                                    onChange={() => handlePermissionToggle(permission, permission.granted)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔐</div>
                    <div className="text-gray-400 text-lg">
                      Select a role from the left panel to manage its permissions
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permission Legend */}
          <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Permission Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Document Permissions</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• View documents in categories</li>
                  <li>• Upload new documents</li>
                  <li>• Edit existing documents</li>
                  <li>• Delete documents</li>
                  <li>• Share documents with others</li>
                </ul>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">User Management</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Manage user accounts</li>
                  <li>• Assign roles to users</li>
                  <li>• View user analytics</li>
                </ul>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">System Administration</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Manage system permissions</li>
                  <li>• Full system administration</li>
                  <li>• View system analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Permissions;