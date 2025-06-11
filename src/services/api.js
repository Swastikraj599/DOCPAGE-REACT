const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Document methods
  async getDocuments(category = null) {
    const queryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    return await this.request(`/documents${queryParam}`);
  }

  async uploadDocument(formData) {
    return await this.request('/documents/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async updateDocument(id, data) {
    return await this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id) {
    return await this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getDocumentFile(id) {
    return await this.request(`/documents/${id}/file`);
  }

  async getDocumentCategories() {
    return await this.request('/documents/categories');
  }

  // Role methods
  async getRoles() {
    return await this.request('/roles');
  }

  async getAssignedRoles() {
    return await this.request('/roles/assigned');
  }

  async createRoleAssignment(userData) {
    return await this.request('/roles/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async assignRole(userId, roleId) {
    return await this.request('/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  // Permission methods
  async getPermissions() {
    return await this.request('/permissions');
  }

  async getRolePermissions(roleId) {
    return await this.request(`/permissions/roles/${roleId}`);
  }

  async grantPermission(roleId, permissionId) {
    return await this.request('/permissions/grant', {
      method: 'POST',
      body: JSON.stringify({ roleId, permissionId }),
    });
  }

  async revokePermission(roleId, permissionId) {
    return await this.request('/permissions/revoke', {
      method: 'POST',
      body: JSON.stringify({ roleId, permissionId }),
    });
  }

  async grantDocumentPermission(documentId, roleId, permissionType) {
    return await this.request('/permissions/document/grant', {
      method: 'POST',
      body: JSON.stringify({ documentId, roleId, permissionType }),
    });
  }

  async getDocumentPermissions(documentId) {
    return await this.request(`/permissions/document/${documentId}`);
  }
}

export default new ApiService();