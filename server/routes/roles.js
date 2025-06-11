const express = require('express');
const pool = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Get all roles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id, r.name, r.description, r.created_at,
        COUNT(ur.user_id) as user_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.id, r.name, r.description, r.created_at
      ORDER BY r.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get assigned roles (users with roles)
router.get('/assigned', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone_number,
        r.name as role, r.description as role_description,
        ur.assigned_at as created_date
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.is_active = true
      ORDER BY ur.assigned_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assigned roles error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned roles' });
  }
});

// Assign role to user
router.post('/assign', authenticateToken, checkPermission('assign_roles'), async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const assignedBy = req.user.id;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if role exists
    const roleResult = await pool.query('SELECT id FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Assign role
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT (user_id, role_id) DO NOTHING',
      [userId, roleId, assignedBy]
    );

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// Create new role assignment (from frontend form)
router.post('/create', authenticateToken, checkPermission('assign_roles'), async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, role } = req.body;
    const assignedBy = req.user.id;

    // This endpoint creates a user and assigns a role in one operation
    // First, create the user (reuse auth logic)
    const bcrypt = require('bcryptjs');
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, passwordHash, firstName, lastName, phoneNumber]
    );

    const userId = userResult.rows[0].id;

    // Get role ID
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const roleId = roleResult.rows[0].id;

    // Assign role
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
      [userId, roleId, assignedBy]
    );

    res.status(201).json({ message: 'User created and role assigned successfully' });
  } catch (error) {
    console.error('Create role assignment error:', error);
    res.status(500).json({ error: 'Failed to create role assignment' });
  }
});

module.exports = router;