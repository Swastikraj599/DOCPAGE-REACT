import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FaEye, FaEdit, FaTrash, FaShareAlt, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../pages/AssignedDocuments.css";
import { jsPDF } from "jspdf";

const AssignedDocuments = () => {
  const [documents, setDocuments] = useState([]);

  // Function to load documents from localStorage
  const loadDocuments = () => {
    const storedDocs = JSON.parse(localStorage.getItem("documents")) || [];
    setDocuments(storedDocs);
  };

  useEffect(() => {
    loadDocuments();
    
    // Listen for storage changes to update documents when they're added from other components
    const handleStorageChange = (e) => {
      if (e.key === 'documents') {
        loadDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events in case documents are updated in the same tab
    const handleDocumentUpdate = () => {
      loadDocuments();
    };

    window.addEventListener('documentsUpdated', handleDocumentUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('documentsUpdated', handleDocumentUpdate);
    };
  }, []);

  const handlePreview = (doc) => {
    Swal.fire({
      title: doc.name,
      html: `<iframe src="${doc.fileDataUrl}" width="100%" height="400px"></iframe>`,
      showCloseButton: true,
      width: 800,
    });
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This document will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
        localStorage.setItem("documents", JSON.stringify(newDocs));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('documentsUpdated'));
        
        Swal.fire("Deleted!", "The document has been deleted.", "success");
      }
    });
  };

  const handleEdit = (doc) => {
    Swal.fire({
      title: 'Edit Document',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Document Name:</label>
            <input type="text" id="edit-name" value="${doc.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category:</label>
            <select id="edit-category" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="Reports" ${doc.category === 'Reports' ? 'selected' : ''}>Reports</option>
              <option value="Contracts" ${doc.category === 'Contracts' ? 'selected' : ''}>Contracts</option>
              <option value="Invoices" ${doc.category === 'Invoices' ? 'selected' : ''}>Invoices</option>
              <option value="Receipts" ${doc.category === 'Receipts' ? 'selected' : ''}>Receipts</option>
              <option value="Presentations" ${doc.category === 'Presentations' ? 'selected' : ''}>Presentations</option>
              <option value="Others" ${doc.category === 'Others' ? 'selected' : ''}>Others</option>
            </select>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Author:</label>
            <input type="text" id="edit-author" value="${doc.author || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Date:</label>
            <input type="date" id="edit-date" value="${doc.date || ''}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
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
        const category = document.getElementById('edit-category').value;
        const author = document.getElementById('edit-author').value;
        const date = document.getElementById('edit-date').value;
        const description = document.getElementById('edit-description').value;

        if (!name.trim()) {
          Swal.showValidationMessage('Document name is required');
          return false;
        }
        if (!category) {
          Swal.showValidationMessage('Category is required');
          return false;
        }
        if (!author.trim()) {
          Swal.showValidationMessage('Author is required');
          return false;
        }
        if (!date) {
          Swal.showValidationMessage('Date is required');
          return false;
        }
        if (!description.trim()) {
          Swal.showValidationMessage('Description is required');
          return false;
        }

        return { name, category, author, date, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          // Get current documents from localStorage
          const storedDocs = localStorage.getItem('documents');
          const allDocs = storedDocs ? JSON.parse(storedDocs) : [];
          
          // Find and update the document
          const updatedDocs = allDocs.map(document => {
            if (document.id === doc.id) {
              return {
                ...document,
                name: result.value.name,
                category: result.value.category,
                author: result.value.author,
                date: result.value.date,
                description: result.value.description
              };
            }
            return document;
          });
          
          // Save back to localStorage
          localStorage.setItem('documents', JSON.stringify(updatedDocs));
          
          // Update local state
          setDocuments(updatedDocs);
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('documentsUpdated'));
          
          Swal.fire('Success!', 'Document updated successfully!', 'success');
        } catch (error) {
          console.error("Error updating document:", error);
          Swal.fire('Error', 'Failed to update document', 'error');
        }
      }
    });
  };

  const handleShare = (doc) => {
    Swal.fire({
      title: "Send via Email",
      input: "email",
      inputLabel: "Enter recipient email",
      inputPlaceholder: "example@example.com",
      showCancelButton: true,
      confirmButtonText: "Send Email",
      preConfirm: (email) => {
        if (!email) return Swal.showValidationMessage("Email is required");
        return email;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("http://localhost:5000/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: result.value,
              subject: `Shared Document: ${doc.name}`,
              text: "Here is the document you requested.",
              attachment: {
                filename: `${doc.name}.pdf`,
                content: doc.fileDataUrl.split(",")[1],
                contentType: "application/pdf",
              },
            }),
          });

          const data = await res.json();
          if (res.ok) {
            Swal.fire("Success", "Email sent successfully", "success");
          } else {
            Swal.fire("Error", data.error || "Failed to send email", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Something went wrong", "error");
        }
      }
    });
  };

  const handleDescription = (doc) => {
    Swal.fire({
      title: "Document Description",
      text: doc.description || "No description available.",
      icon: "info",
    });
  };

  return (
    <Layout>
      <div className="p-4 text-white">
        <h2 className="text-3xl font-bold mb-4">Assigned Documents</h2>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No documents found.</p>
              <p className="text-gray-500 text-sm mt-2">
                Documents uploaded in DocumentsCategories will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-white">
              <thead>
                <tr className="bg-gray-700 text-sm uppercase">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Uploaded On</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc.id || index} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-4">{doc.name}</td>
                    <td className="py-2 px-4">{doc.category}</td>
                    <td className="py-2 px-4">{doc.author}</td>
                    <td className="py-2 px-4">{doc.date}</td>
                    <td className="py-2 px-4 space-x-2">
                      <button 
                        onClick={() => handlePreview(doc)} 
                        className="bg-green-600 p-2 rounded hover:bg-green-700"
                        title="Preview"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleEdit(doc)} 
                        className="bg-blue-600 p-2 rounded hover:bg-blue-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleShare(doc)} 
                        className="bg-orange-500 p-2 rounded hover:bg-orange-600"
                        title="Share"
                      >
                        <FaShareAlt />
                      </button>
                      <button 
                        onClick={() => handleDescription(doc)} 
                        className="bg-yellow-500 p-2 rounded hover:bg-yellow-600"
                        title="Description"
                      >
                        <FaInfoCircle />
                      </button>
                      <button 
                        onClick={() => handleDelete(index)} 
                        className="bg-red-600 p-2 rounded hover:bg-red-700"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssignedDocuments;
