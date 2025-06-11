import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './DocumentCategories.css';
import Layout from '../components/Layout';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  { key: 'Reports', title: 'Reports', icon: 'fa-file-alt', bg: '#4CAF50' },
  { key: 'Contracts', title: 'Contracts', icon: 'fa-file-signature', bg: '#2196F3' },
  { key: 'Invoices', title: 'Invoices', icon: 'fa-file-invoice-dollar', bg: '#FFA726' },
  { key: 'Receipts', title: 'Receipts', icon: 'fa-receipt', bg: '#FF9800' },
  { key: 'Presentations', title: 'Presentations', icon: 'fa-file-powerpoint', bg: '#9C27B0' },
  { key: 'Others', title: 'Others', icon: 'fa-ellipsis-h', bg: '#9E9E9E' }
];

const DocumentCategories = () => {
  const { hasPermission } = useAuth();
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    date: '',
    description: '',
    file: null
  });

  // Load documents when component mounts
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const documents = await apiService.getDocuments();
      setAllDocuments(documents);
    } catch (error) {
      console.error('Error loading documents:', error);
      Swal.fire('Error', 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryKey, categoryTitle) => {
    setSelectedCategory({ key: categoryKey, title: categoryTitle });
    setShowOptionsDialog(true);
  };

  const handleViewDocuments = async () => {
    setShowOptionsDialog(false);
    await showDocuments(selectedCategory.key, selectedCategory.title);
  };

  const handleAddDocument = () => {
    if (!hasPermission('upload_documents')) {
      Swal.fire('Access Denied', 'You do not have permission to upload documents', 'error');
      return;
    }
    
    setShowOptionsDialog(false);
    setShowAddForm(true);
    setFormData({
      name: '',
      author: '',
      date: '',
      description: '',
      file: null
    });
  };

  const showDocuments = async (categoryKey, categoryTitle) => {
    try {
      const categoryDocs = await apiService.getDocuments(categoryKey);
      
      if (categoryDocs.length === 0) {
        Swal.fire('No Documents', `No documents found in ${categoryTitle} category.`, 'info');
        return;
      }

      setSelectedDocs(categoryDocs);
      setModalTitle(categoryTitle);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch documents", "error");
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.author || !formData.date || !formData.description || !formData.file) {
      Swal.fire('Error', 'Please fill all fields and select a file', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('documentDate', formData.date);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', selectedCategory.key);
      formDataToSend.append('file', formData.file);

      await apiService.uploadDocument(formDataToSend);
      
      setShowAddForm(false);
      await loadDocuments(); // Reload documents
      
      Swal.fire('Success!', 'Document uploaded successfully!', 'success').then(() => {
        showDocuments(selectedCategory.key, selectedCategory.title);
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      Swal.fire('Error', error.message || 'Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const previewDocument = async (doc) => {
    try {
      const response = await apiService.getDocumentFile(doc.id);
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .header { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
              .content { text-align: center; }
              iframe, img { max-width: 100%; height: 500px; border: none; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${doc.name}</h2>
              <p><strong>Author:</strong> ${doc.author}</p>
              <p><strong>Date:</strong> ${new Date(doc.document_date).toLocaleDateString()}</p>
            </div>
            <div class="content">
              ${doc.file_type.startsWith('image/') 
                ? `<img src="${fileURL}" alt="${doc.name}" />` 
                : `<iframe src="${fileURL}" width="100%" height="500px"></iframe>`
              }
            </div>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Preview error:', error);
      Swal.fire('Error', 'Failed to preview document. You may not have permission to view this document.', 'error');
    }
  };

  const editDocument = (doc) => {
    if (!hasPermission('edit_documents')) {
      Swal.fire('Access Denied', 'You do not have permission to edit documents', 'error');
      return;
    }

    Swal.fire({
      title: 'Edit Document',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Document Name:</label>
            <input type="text" id="edit-name" value="${doc.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Author:</label>
            <input type="text" id="edit-author" value="${doc.author || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Date:</label>
            <input type="date" id="edit-date" value="${doc.document_date || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description:</label>
            <textarea id="edit-description" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${doc.description || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      width: '500px',
      preConfirm: () => {
        const name = document.getElementById('edit-name').value;
        const author = document.getElementById('edit-author').value;
        const date = document.getElementById('edit-date').value;
        const description = document.getElementById('edit-description').value;

        if (!name.trim() || !author.trim() || !date || !description.trim()) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }

        return { name, author, documentDate: date, description };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.updateDocument(doc.id, result.value);
          await loadDocuments();
          setSelectedDocs(prev => prev.map(d => 
            d.id === doc.id ? { ...d, ...result.value } : d
          ));
          Swal.fire('Success!', 'Document updated successfully!', 'success');
        } catch (error) {
          console.error("Error updating document:", error);
          Swal.fire('Error', error.message || 'Failed to update document', 'error');
        }
      }
    });
  };

  const shareDocument = async (doc) => {
    if (!hasPermission('share_documents')) {
      Swal.fire('Access Denied', 'You do not have permission to share documents', 'error');
      return;
    }

    try {
      const response = await apiService.getDocumentFile(doc.id);
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = doc.file_name || `${doc.name}.pdf`;
      link.click();

      Swal.fire({
        title: "Send Document",
        icon: "info",
        html: `
          <p>The document <b>${doc.name}</b> has been downloaded.</p>
          <p>Please <b>attach it manually</b> when sending via email or WhatsApp.</p>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Email",
        denyButtonText: "WhatsApp",
      }).then((result) => {
        if (result.isConfirmed) {
          const subject = encodeURIComponent(`Shared Document: ${doc.name}`);
          const body = encodeURIComponent(`Hi,\n\nPlease find the attached document: ${doc.name}.\n\nDescription: ${doc.description}\n\nThanks!`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        } else if (result.isDenied) {
          const text = encodeURIComponent(`📄 *${doc.name}*\n\n${doc.description}\n\nI've just downloaded the file. Sending it to you shortly.`);
          window.open(`https://wa.me/?text=${text}`, "_blank");
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      Swal.fire('Error', 'Failed to download document for sharing', 'error');
    }
  };

  const deleteDocument = async (doc) => {
    if (!hasPermission('delete_documents')) {
      Swal.fire('Access Denied', 'You do not have permission to delete documents', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the document permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.deleteDocument(doc.id);
          await loadDocuments();
          setSelectedDocs(prev => prev.filter(d => d.id !== doc.id));
          Swal.fire('Deleted!', 'Document has been deleted.', 'success');
        } catch (error) {
          console.error("Error deleting document:", error);
          Swal.fire('Error', error.message || 'Failed to delete document', 'error');
        }
      }
    });
  };

  const showDescription = (doc) => {
    Swal.fire('Description', doc.description || 'No description available.', 'info');
  };

  // Function to get document count for each category
  const getDocumentCount = (categoryKey) => {
    return allDocuments.filter(doc => doc.category_name === categoryKey).length;
  };

  return (
    <Layout>
      <div className="document-categories">
        <h1>Document Categories</h1>
        <p>Total Documents: {allDocuments.length}</p>

        {loading && <div className="text-center">Loading...</div>}

        <div className="categories-grid">
          {categories.map(cat => (
            <div
              key={cat.key}
              className="category-card"
              onClick={() => handleCategoryClick(cat.key, cat.title)}
            >
              <div className="category-header">
                <div className="category-icon" style={{ background: cat.bg }}>
                  <i className={`fas ${cat.icon}`}></i>
                </div>
                <h2 className="category-title">{cat.title}</h2>
                <span className="document-count">{getDocumentCount(cat.key)} documents</span>
              </div>
            </div>
          ))}
        </div>

        {/* Options Dialog */}
        {showOptionsDialog && (
          <div className="modal-overlay">
            <div className="options-dialog">
              <div className="dialog-header">
                <h2>{selectedCategory?.title}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowOptionsDialog(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="dialog-content">
                <div className="option-card" onClick={handleAddDocument}>
                  <div className="option-icon add-icon">
                    <i className="fas fa-plus"></i>
                  </div>
                  <h3>Add New Document</h3>
                  <p>Upload a new document to this category</p>
                </div>
                <div className="option-card" onClick={handleViewDocuments}>
                  <div className="option-icon view-icon">
                    <i className="fas fa-folder-open"></i>
                  </div>
                  <h3>View Documents</h3>
                  <p>See all uploaded documents in this category ({getDocumentCount(selectedCategory?.key || '')} documents)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Document Form */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="add-form-dialog">
              <div className="form-header">
                <h2>Add New Document to {selectedCategory?.title}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="add-document-form">
                <div className="form-group">
                  <label htmlFor="doc-name">
                    <i className="fas fa-file-alt"></i>
                    Document Name
                  </label>
                  <input
                    type="text"
                    id="doc-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter document name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doc-author">
                    <i className="fas fa-user"></i>
                    Author
                  </label>
                  <input
                    type="text"
                    id="doc-author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doc-date">
                    <i className="fas fa-calendar"></i>
                    Date
                  </label>
                  <input
                    type="date"
                    id="doc-date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doc-description">
                    <i className="fas fa-align-left"></i>
                    Description
                  </label>
                  <textarea
                    id="doc-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter document description"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group file-upload">
                  <label htmlFor="doc-file">
                    <i className="fas fa-upload"></i>
                    Upload File
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="doc-file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.ppt,.pptx"
                      required
                    />
                    <div className="file-input-display">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>
                        {formData.file ? formData.file.name : 'Choose file or drag & drop'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="submit-btn" 
                    onClick={handleFormSubmit}
                    disabled={loading}
                  >
                    <i className="fas fa-save"></i>
                    {loading ? 'Uploading...' : 'Save Document'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document List Modal */}
        {selectedDocs.length > 0 && (
          <div className="document-modal">
            <h2>{modalTitle} Documents ({selectedDocs.length})</h2>
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.author}</td>
                    <td>{new Date(doc.document_date).toLocaleDateString()}</td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => previewDocument(doc)} title="Preview">
                        <i className="fas fa-eye" />
                      </button>
                      {hasPermission('edit_documents') && (
                        <button onClick={() => editDocument(doc)} title="Edit">
                          <i className="fas fa-edit" />
                        </button>
                      )}
                      {hasPermission('share_documents') && (
                        <button onClick={() => shareDocument(doc)} title="Share">
                          <i className="fas fa-share" />
                        </button>
                      )}
                      <button onClick={() => showDescription(doc)} title="Info">
                        <i className="fas fa-circle-info" />
                      </button>
                      {hasPermission('delete_documents') && (
                        <button onClick={() => deleteDocument(doc)} title="Delete">
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setSelectedDocs([])} className="close-modal-btn">Close</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentCategories;