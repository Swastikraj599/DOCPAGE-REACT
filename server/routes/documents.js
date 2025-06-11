const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const pool = require('../config/database');
const { authenticateToken, checkPermission, checkDocumentPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all documents (with permission filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    let query = `
      SELECT 
        d.id, d.name, d.description, d.file_name, d.file_size, d.file_type,
        d.author, d.document_date, d.created_at, d.updated_at,
        dc.name as category_name, dc.color as category_color,
        u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.is_active = true
      AND (
        -- User has general document read permission
        EXISTS (
          SELECT 1 FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          JOIN user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = $1 AND p.name = 'view_documents'
        )
        OR
        -- User has specific document permission
        EXISTS (
          SELECT 1 FROM document_permissions dp
          JOIN user_roles ur ON dp.role_id = ur.role_id
          WHERE ur.user_id = $1 AND dp.document_id = d.id AND dp.permission_type = 'read'
        )
        OR
        -- User uploaded the document
        d.uploaded_by = $1
      )
    `;

    const params = [userId];

    if (category) {
      query += ' AND dc.name = $2';
      params.push(category);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document
router.post('/upload', authenticateToken, checkPermission('upload_documents'), upload.single('file'), async (req, res) => {
  try {
    const { name, description, author, documentDate, category } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get category ID
    const categoryResult = await pool.query('SELECT id FROM document_categories WHERE name = $1', [category]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const categoryId = categoryResult.rows[0].id;

    // Save document metadata to database
    const documentResult = await pool.query(`
      INSERT INTO documents (name, description, file_name, file_path, file_size, file_type, category_id, uploaded_by, author, document_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name,
      description,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      categoryId,
      userId,
      author,
      documentDate
    ]);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: documentResult.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up uploaded file if database save fails
    if (req.file) {
      fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get document file
router.get('/:id/file', authenticateToken, checkDocumentPermission('read'), async (req, res) => {
  try {
    const documentId = req.params.id;

    const documentResult = await pool.query(
      'SELECT file_path, file_name, file_type FROM documents WHERE id = $1 AND is_active = true',
      [documentId]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documentResult.rows[0];
    const filePath = path.resolve(document.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Update document
router.put('/:id', authenticateToken, checkDocumentPermission('update'), async (req, res) => {
  try {
    const documentId = req.params.id;
    const { name, description, author, documentDate, category } = req.body;

    // Get category ID if category is provided
    let categoryId = null;
    if (category) {
      const categoryResult = await pool.query('SELECT id FROM document_categories WHERE name = $1', [category]);
      if (categoryResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      categoryId = categoryResult.rows[0].id;
    }

    // Update document
    const updateResult = await pool.query(`
      UPDATE documents 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          author = COALESCE($3, author),
          document_date = COALESCE($4, document_date),
          category_id = COALESCE($5, category_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND is_active = true
      RETURNING *
    `, [name, description, author, documentDate, categoryId, documentId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, checkDocumentPermission('delete'), async (req, res) => {
  try {
    const documentId = req.params.id;

    // Get document file path before deletion
    const documentResult = await pool.query(
      'SELECT file_path FROM documents WHERE id = $1 AND is_active = true',
      [documentId]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = documentResult.rows[0].file_path;

    // Soft delete document
    await pool.query(
      'UPDATE documents SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [documentId]
    );

    // Delete physical file
    if (fs.existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM document_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;