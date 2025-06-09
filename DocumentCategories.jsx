import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../pages/DocumentCategories.css';
import Layout from '../components/Layout';

const categories = [
  { key: 'Reports', title: 'Reports', icon: 'fa-file-alt', bg: '#4CAF50' },
  { key: 'Contracts', title: 'Contracts', icon: 'fa-file-signature', bg: '#2196F3' },
  { key: 'Invoices', title: 'Invoices', icon: 'fa-file-invoice-dollar', bg: '#FFA726' },
  { key: 'Receipts', title: 'Receipts', icon: 'fa-receipt', bg: '#FF9800' },
  { key: 'Presentations', title: 'Presentations', icon: 'fa-file-powerpoint', bg: '#9C27B0' },
  { key: 'Others', title: 'Others', icon: 'fa-ellipsis-h', bg: '#9E9E9E' }
];

const DocumentCategories = () => {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    date: '',
    description: '',
    file: null
  });

  // Function to notify other components about document updates
  const notifyDocumentUpdate = () => {
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('documentsUpdated'));
  };

  // Load documents when component mounts
  useEffect(() => {
    loadDocuments();
    
    // Listen for document updates from other components
    const handleDocumentUpdate = () => {
      loadDocuments();
    };

    window.addEventListener('documentsUpdated', handleDocumentUpdate);

    return () => {
      window.removeEventListener('documentsUpdated', handleDocumentUpdate);
    };
  }, []);

  const loadDocuments = () => {
    try {
      // Use localStorage instead of sessionStorage to sync with AssignedDocuments
      const stored = localStorage.getItem('documents');
      const docs = stored ? JSON.parse(stored) : [];
      setAllDocuments(docs);
      console.log('Loaded documents:', docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setAllDocuments([]);
    }
  };

  const saveDocuments = (documents) => {
    try {
      // Use localStorage instead of sessionStorage to sync with AssignedDocuments
      localStorage.setItem('documents', JSON.stringify(documents));
      setAllDocuments(documents);
      
      // Notify other components about the update
      notifyDocumentUpdate();
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const handleCategoryClick = (categoryKey, categoryTitle) => {
    setSelectedCategory({ key: categoryKey, title: categoryTitle });
    setShowOptionsDialog(true);
  };

  const handleViewDocuments = () => {
    setShowOptionsDialog(false);
    showDocuments(selectedCategory.key, selectedCategory.title);
  };

  const handleAddDocument = () => {
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

  const showDocuments = (categoryKey, categoryTitle) => {
    try {
      console.log("All docs:", allDocuments);
      console.log("Looking for category:", categoryKey);
      
      // Filter documents by category
      const categoryDocs = allDocuments.filter(doc => {
        console.log("Doc category:", doc.category, "Looking for:", categoryKey);
        return doc.category === categoryKey;
      });
      
      console.log("Category docs found:", categoryDocs);
      
      if (categoryDocs.length === 0) {
        Swal.fire('No Documents', `No documents found in ${categoryTitle} category.`, 'info');
        return;
      }

      // Set the filtered documents and modal title
      setSelectedDocs(categoryDocs);
      setModalTitle(categoryTitle);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Failed to fetch documents", "error");
    }
  };

  const handleFormSubmit = () => {
    
    if (!formData.name || !formData.author || !formData.date || !formData.description || !formData.file) {
      Swal.fire('Error', 'Please fill all fields and select a file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newDocument = {
        id: Date.now() + Math.random(), // More unique ID generation
        name: formData.name,
        author: formData.author,
        date: formData.date,
        description: formData.description,
        category: selectedCategory.key,
        fileDataUrl: e.target.result,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        fileType: formData.file.type,
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      try {
        // Add to existing documents
        const updatedDocs = [...allDocuments, newDocument];
        saveDocuments(updatedDocs);
        
        console.log('New document added:', newDocument);
        
        setShowAddForm(false);
        Swal.fire('Success!', 'Document added successfully!', 'success').then(() => {
          // Optionally show the documents in this category
          showDocuments(selectedCategory.key, selectedCategory.title);
        });
      } catch (error) {
        console.error("Error saving document:", error);
        Swal.fire('Error', 'Failed to save document', 'error');
      }
    };

    reader.readAsDataURL(formData.file);
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

  /*const previewDocument = (doc) => {
    if (doc.fileDataUrl) {
      // Create a new window/tab with the document
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${doc.name}</title></head>
            <body style="margin:0; padding:20px; font-family: Arial, sans-serif;">
              <h2>${doc.name}</h2>
              <p><strong>Author:</strong> ${doc.author}</p>
              <p><strong>Date:</strong> ${doc.date}</p>
              <p><strong>Category:</strong> ${doc.category}</p>
              <p><strong>Description:</strong> ${doc.description}</p>
              <hr>
              <div style="text-align: center;">
                ${doc.fileDataUrl.startsWith('data:image') 
                  ? `<img src="${doc.fileDataUrl}" style="max-width: 100%; height: auto;" />` 
                  : `<embed src="${doc.fileDataUrl}" width="100%" height="600px" type="application/pdf" />
                     <p>If the document doesn't display, <a href="${doc.fileDataUrl}" download="${doc.name}">click here to download</a></p>`
                }
              </div>
            </body>
          </html>
        `);
      }
    } else {
      Swal.fire('Error', 'Document preview not available', 'error');
    }
  };

  const showDescription = (doc) => {
    Swal.fire('Description', doc.description || 'No description available.', 'info');
  };*/

const previewDocument = (doc) => {
  if (doc.fileDataUrl) {
    const newWindow = window.open('', '_blank', 'width=800,height=600');

    if (newWindow) {
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const secureHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${escapeHtml(doc.name)}</title>
          <meta charset="UTF-8" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              overflow: auto;
              height: 100%;
              user-select: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
            }
            .content-wrapper {
              padding: 20px;
              box-sizing: border-box;
              height: 100vh;
              overflow-y: auto;
            }
            .document-container {
              background: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 10px;
              position: relative;
            }
            .document-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 10;
              pointer-events: auto;
            }
            iframe {
              width: 100%;
              height: 500px;
              border: none;
              pointer-events: none;
            }
            img {
              max-width: 100%;
              height: auto;
              pointer-events: none;
              user-select: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
            }
            .warning {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(255, 0, 0, 0.9);
              color: white;
              display: none;
              justify-content: center;
              align-items: center;
              z-index: 100000;
              user-select: none;
              font-size: 24px;
              font-weight: bold;
            }
            * {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              -khtml-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
            }
            .header-info {
              user-select: none !important;
              pointer-events: none;
            }
            .header-info h2, .header-info p {
              user-select: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
            }
          </style>
        </head>
        <body>
          <div id="warning" class="warning">
            <div><h2>⚠️ Action Not Allowed ⚠️</h2></div>
          </div>

          <div class="content-wrapper">
            <div class="header-info">
              <h2>${escapeHtml(doc.name)}</h2>
              <p><strong>Author:</strong> ${escapeHtml(doc.author)}</p>
              <p><strong>Date:</strong> ${escapeHtml(doc.date)}</p>
              <hr />
            </div>
            <div class="document-container">
              ${
                doc.fileDataUrl.startsWith('data:image')
                  ? `<img src="${doc.fileDataUrl}" draggable="false" />`
                  : `<iframe src="${doc.fileDataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH" tabindex="-1"></iframe>`
              }
            </div>
          </div>

          <script>
            const warning = document.getElementById('warning');
            let warningTimeout = null;
            
            function showWarning() {
              if (warning.style.display === 'flex') return;
              warning.style.display = 'flex';
              clearTimeout(warningTimeout);
              warningTimeout = setTimeout(() => {
                warning.style.display = 'none';
              }, 1500);
            }

            // Disable all keyboard shortcuts and specific keys
            document.addEventListener('keydown', (e) => {
              const forbiddenKeys = ['p', 's', 'a', 'c', 'u', 'x', 'v', 'z', 'y'];
              if (e.ctrlKey && forbiddenKeys.includes(e.key.toLowerCase())) {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                return false;
              }
              
              if (e.key === 'F12' || e.key === 'F5' || e.key === 'PrintScreen') {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                return false;
              }
              
              if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                return false;
              }
            });

            document.addEventListener('keyup', (e) => {
              if (e.key === 'PrintScreen') {
                e.preventDefault();
                try { 
                  navigator.clipboard.writeText(''); 
                } catch {}
                showWarning();
              }
            });

            // Block all mouse events and scrolling on document container
            const docContainer = document.querySelector('.document-container');
            
            ['mousedown', 'mouseup', 'click', 'wheel', 'scroll'].forEach(eventType => {
              docContainer.addEventListener(eventType, (e) => {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                return false;
              });
            });

            // Block scrolling on iframe and images specifically
            document.querySelectorAll('iframe, img').forEach(element => {
              element.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                return false;
              });
            });

            // Prevent right-click context menu everywhere
            document.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            // Prevent drag and drop
            document.addEventListener('dragstart', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            // Prevent copy/cut/paste
            document.addEventListener('copy', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            document.addEventListener('cut', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            document.addEventListener('paste', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            // Prevent text selection
            document.addEventListener('selectstart', (e) => {
              e.preventDefault();
              e.stopPropagation();
              showWarning();
              return false;
            });

            // More aggressive text selection clearing
            setInterval(() => {
              try {
                if (window.getSelection && window.getSelection().toString().length > 0) {
                  window.getSelection().removeAllRanges();
                  showWarning();
                }
                if (document.selection && document.selection.clear) {
                  document.selection.clear();
                }
              } catch (e) {}
            }, 50);

            // Shorter blur time and immediate focus back
            window.addEventListener('blur', () => {
              document.body.style.filter = 'blur(10px)';
              setTimeout(() => {
                if (document.hasFocus && !document.hasFocus()) {
                  showWarning();
                }
              }, 50);
            });

            window.addEventListener('focus', () => {
              document.body.style.filter = 'none';
            });

            // Enhanced screenshot detection
            document.addEventListener('keydown', (e) => {
              if (e.key === 'PrintScreen' || 
                  (e.altKey && e.key === 'PrintScreen') ||
                  (e.ctrlKey && e.key === 'PrintScreen') ||
                  (e.shiftKey && e.key === 'PrintScreen') ||
                  (e.metaKey && e.key === 'PrintScreen')) {
                e.preventDefault();
                e.stopPropagation();
                showWarning();
                // Clear clipboard multiple times
                setTimeout(() => {
                  try { navigator.clipboard.writeText(''); } catch {}
                }, 10);
                setTimeout(() => {
                  try { navigator.clipboard.writeText('ACCESS DENIED'); } catch {}
                }, 100);
                return false;
              }
            });

            // Disable text selection on page load
            document.onselectstart = () => false;
            document.onmousedown = (e) => {
              if (e.target.closest('.document-container')) {
                return false;
              }
            };

            // Override common copy methods
            if (typeof window.getSelection !== 'undefined') {
              const originalGetSelection = window.getSelection;
              window.getSelection = function() {
                const selection = originalGetSelection.call(window);
                if (selection.toString().length > 0) {
                  showWarning();
                  selection.removeAllRanges();
                }
                return selection;
              };
            }
          </script>
        </body>
        </html>
      `;

      try {
        newWindow.document.write(secureHTML);
        newWindow.document.close();
      } catch (error) {
        console.error('Error creating preview:', error);
        alert('Error creating document preview');
      }
    } else {
      alert('Unable to open preview window. Please disable popup blockers.');
    }
  } else {
    alert('Document preview not available');
  }
};

  const shareDocument = (doc) => {
    if (!doc.fileDataUrl) {
      Swal.fire('Error', 'No file data available to share', 'error');
      return;
    }

    // Convert base64 to Blob
    const base64ToBlob = (base64, mime = 'application/pdf') => {
      const byteChars = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime });
    };

    const blob = base64ToBlob(doc.fileDataUrl, doc.fileType);
    const fileURL = URL.createObjectURL(blob);

    // Download file
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = doc.fileName || `${doc.name}.pdf`;
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
  };

  const deleteDocument = (docId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the document permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        try {
          // Filter out the document to delete
          const updatedDocs = allDocuments.filter(doc => doc.id !== docId);
          
          // Save updated documents (this will also notify other components)
          saveDocuments(updatedDocs);
          
          // Update the displayed documents
          setSelectedDocs(prev => prev.filter(doc => doc.id !== docId));
          
          Swal.fire('Deleted!', 'Document has been deleted.', 'success');
        } catch (error) {
          console.error("Error deleting document:", error);
          Swal.fire('Error', 'Failed to delete document', 'error');
        }
      }
    });
  };

  // Function to get document count for each category
  const getDocumentCount = (categoryKey) => {
    return allDocuments.filter(doc => doc.category === categoryKey).length;
  };

  return (
    <Layout>
      <div className="document-categories">
        <h1>Document Categories</h1>
        <p>Total Documents: {allDocuments.length}</p>

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
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  <button type="button" className="submit-btn" onClick={handleFormSubmit}>
                    <i className="fas fa-save"></i>
                    Save Document
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
                    <td>{new Date(doc.date).toLocaleDateString()}</td>
                    <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => previewDocument(doc)} title="Preview">
                        <i className="fas fa-eye" />
                      </button>
                      <button onClick={() => editDocument(doc)} title="Edit">
                        <i className="fas fa-edit" />
                      </button>
                      <button onClick={() => shareDocument(doc)} title="Share">
                        <i className="fas fa-share" />
                      </button>
                      <button onClick={() => deleteDocument(doc.id)} title="Delete">
                        <i className="fas fa-trash" />
                      </button>
                      <button onClick={() => showDescription(doc)} title="Info">
                        <i className="fas fa-circle-info" />
                      </button>
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