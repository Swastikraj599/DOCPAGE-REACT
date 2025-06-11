const express = require('express');
const pool = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Get all permissions
router.get('/', authenticateToken, checkPermission('manage_permissions'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permissions ORDER BY resource, action');
    res.json(result.rows);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Get role permissions
router.get('/roles/:roleId', authenticateToken, checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { roleId } = req.params;

    const result = await pool.query(`
      SELECT p.*, 
             CASE WHEN rp.permission_id IS NOT NULL THEN true ELSE false END as granted
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = $1
      ORDER BY p.resource, p.action
    `, [roleId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// Grant permission to role
router.post('/grant', authenticateToken, checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    const grantedBy = req.user.id;

    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES ($1, $2, $3) ON CONFLICT (role_id, permission_id) DO NOTHING',
      [roleId, permissionId, grantedBy]
    );

    res.json({ message: 'Permission granted successfully' });
  } catch (error) {
    console.error('Grant permission error:', error);
    res.status(500).json({ error: 'Failed to grant permission' });
  }
});

// Revoke permission from role
router.post('/revoke', authenticateToken, checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    await pool.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );

    res.json({ message: 'Permission revoked successfully' });
  } catch (error) {
    console.error('Revoke permission error:', error);
    res.status(500).json({ error: 'Failed to revoke permission' });
  }
});

// Grant document-specific permission
router.post('/document/grant', authenticateToken, checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { documentId, roleId, permissionType } = req.body;
    const grantedBy = req.user.id;

    await pool.query(
      'INSERT INTO document_permissions (document_id, role_id, permission_type, granted_by) VALUES ($1, $2, $3, $4) ON CONFLICT (document_id, role_id, permission_type) DO NOTHING',
      [documentId, roleId, permissionType, grantedBy]
    );

    res.json({ message: 'Document permission granted successfully' });
  } catch (error) {
    console.error('Grant document permission error:', error);
    res.status(500).json({ error: 'Failed to grant document permission' });
  }
});

// Get document permissions
router.get('/document/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(`
      SELECT 
        dp.permission_type,
        r.name as role_name,
        r.description as role_description,
        u.first_name || ' ' || u.last_name as granted_by_name,
        dp.granted_at
      FROM document_permissions dp
      JOIN roles r ON dp.role_id = r.id
      LEFT JOIN users u ON dp.granted_by = u.id
      WHERE dp.document_id = $1
      ORDER BY r.name, dp.permission_type
    `, [documentId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get document permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch document permissions' });
  }
});

module.exports = router;