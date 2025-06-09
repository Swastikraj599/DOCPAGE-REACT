import React, { useState, useEffect } from 'react';
import './AssignedRoles.css';
import Layout from '../components/Layout';

const AssignedRolesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [assignedRoles, setAssignedRoles] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    'Administrator',
    'Manager',
    'Supervisor',
    'Team Lead',
    'Employee',
    'Analyst',
    'Coordinator',
    'Intern'
  ];

  // ✅ Load roles from localStorage on initial mount
  useEffect(() => {
    const savedRoles = localStorage.getItem('assignedRoles');
    if (savedRoles) {
      setAssignedRoles(JSON.parse(savedRoles));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const newRole = {
        id: assignedRoles.length + 1,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        createdDate: new Date().toISOString().split('T')[0]
      };

      const updatedRoles = [...assignedRoles, newRole];
      setAssignedRoles(updatedRoles);

      // ✅ Save to localStorage
      localStorage.setItem('assignedRoles', JSON.stringify(updatedRoles));

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: ''
      });

      setIsFormOpen(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
    setErrors({});
    setIsFormOpen(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Layout>
      <div className="assigned-roles-container">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="header-section">
            <div className="header-left">
              <div className="header-icon">
                <span className="text-white text-2xl font-bold">👥</span>
              </div>
              <div className="header-title">
                <h1>Assigned Roles</h1>
                <p>Manage user roles and permissions</p>
              </div>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="create-btn">
              <span className="text-xl mr-2">➕</span>
              <span>Create Roles</span>
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            <div className="table-header">
              <h2><span className="mr-2">👤</span>Assigned Roles Overview</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead className="table-head">
                  <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedRoles.map(role => (
                    <tr key={role.id} className="table-row">
                      <td>{role.id}</td>
                      <td>{role.firstName}</td>
                      <td>{role.lastName}</td>
                      <td>{role.email}</td>
                      <td>{role.phoneNumber}</td>
                      <td><span className="role-badge">{role.role}</span></td>
                      <td>{role.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assignedRoles.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p className="text-gray-500 text-lg">No roles assigned yet</p>
                <p className="text-gray-400">Click "Create Roles" to add your first role</p>
              </div>
            )}
          </div>

          {/* Modal Form */}
          {isFormOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Create New Role</h3>
                  <button onClick={handleCancel} className="close-btn">
                    <span className="text-white text-xl">✕</span>
                  </button>
                </div>

                <div className="form-content">
                  {['firstName', 'lastName', 'email', 'phoneNumber'].map((field) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{field.replace(/([A-Z])/g, ' $1')} *</label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder={`Enter ${field}`}
                      />
                      {errors[field] && <p className="error-message">{errors[field]}</p>}
                    </div>
                  ))}

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <p className="error-message">{errors.password}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <div className="password-input-container">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select a role</option>
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {errors.role && <p className="error-message">{errors.role}</p>}
                  </div>

                  <div className="form-buttons">
                    <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="btn-primary">Create Role</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default AssignedRolesPage;