import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FaEye, FaEdit, FaTrash, FaShareAlt, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./AssignedDocuments.css";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";

const AssignedDocuments = () => {
  const { hasPermission } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to load documents from API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await apiService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      Swal.fire('Error', 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handlePreview = async (doc) => {
    try {
      const response = await apiService.getDocumentFile(doc.id);
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      
      Swal.fire({
        title: doc.name,
        html: `<iframe src="${fileURL}" width="100%" height="400px"></iframe>`,
        showCloseButton: true,
        width: 800,
      });
    } catch (error) {
      console.error('Preview error:', error);
      Swal.fire('Error', 'Failed to preview document. You may not have permission to view this document.', 'error');
    }
  };

  const handleDelete = async (doc) => {
    if (!hasPermission('delete_documents')) {
      Swal.fire('Access Denied', 'You do not have permission to delete documents', 'error');
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "This document will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.deleteDocument(doc.id);
          await loadDocuments(); // Reload documents
          Swal.fire("Deleted!", "The document has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting document:", error);
          Swal.fire("Error", error.message || "Failed to delete document", "error");
        }
      }
    });
  };

  const handleEdit = (doc) => {
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
          await loadDocuments(); // Reload documents
          Swal.fire('Success!', 'Document updated successfully!', 'success');
        } catch (error) {
          console.error("Error updating document:", error);
          Swal.fire('Error', error.message || 'Failed to update document', 'error');
        }
      }
    });
  };

  const handleShare = async (doc) => {
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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No documents found.</p>
              <p className="text-gray-500 text-sm mt-2">
                Documents uploaded in Document Categories will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-white">
              <thead>
                <tr className="bg-gray-700 text-sm uppercase">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Document Date</th>
                  <th className="py-3 px-4">Uploaded On</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-4">{doc.name}</td>
                    <td className="py-2 px-4">{doc.category_name}</td>
                    <td className="py-2 px-4">{doc.author}</td>
                    <td className="py-2 px-4">{new Date(doc.document_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 space-x-2">
                      <button 
                        onClick={() => handlePreview(doc)} 
                        className="bg-green-600 p-2 rounded hover:bg-green-700"
                        title="Preview"
                      >
                        <FaEye />
                      </button>
                      {hasPermission('edit_documents') && (
                        <button 
                          onClick={() => handleEdit(doc)} 
                          className="bg-blue-600 p-2 rounded hover:bg-blue-700"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {hasPermission('share_documents') && (
                        <button 
                          onClick={() => handleShare(doc)} 
                          className="bg-orange-500 p-2 rounded hover:bg-orange-600"
                          title="Share"
                        >
                          <FaShareAlt />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDescription(doc)} 
                        className="bg-yellow-500 p-2 rounded hover:bg-yellow-600"
                        title="Description"
                      >
                        <FaInfoCircle />
                      </button>
                      {hasPermission('delete_documents') && (
                        <button 
                          onClick={() => handleDelete(doc)} 
                          className="bg-red-600 p-2 rounded hover:bg-red-700"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
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