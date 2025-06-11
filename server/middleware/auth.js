const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Check if user has the required permission through their roles
      const permissionResult = await pool.query(`
        SELECT p.name 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = $1 AND p.name = $2
      `, [userId, requiredPermission]);

      if (permissionResult.rows.length === 0) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const checkDocumentPermission = (permissionType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const documentId = req.params.id || req.body.documentId;

      // Check if user has permission for this specific document
      const permissionResult = await pool.query(`
        SELECT dp.permission_type 
        FROM document_permissions dp
        JOIN user_roles ur ON dp.role_id = ur.role_id
        WHERE ur.user_id = $1 AND dp.document_id = $2 AND dp.permission_type = $3
      `, [userId, documentId, permissionType]);

      if (permissionResult.rows.length === 0) {
        // Check if user has general permission for documents
        const generalPermissionResult = await pool.query(`
          SELECT p.name 
          FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          JOIN user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = $1 AND p.action = $2 AND p.resource = 'documents'
        `, [userId, permissionType === 'read' ? 'read' : permissionType]);

        if (generalPermissionResult.rows.length === 0) {
          return res.status(403).json({ error: 'Insufficient document permissions' });
        }
      }

      next();
    } catch (error) {
      console.error('Document permission check error:', error);
      return res.status(500).json({ error: 'Document permission check failed' });
    }
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkDocumentPermission
};