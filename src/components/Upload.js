import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await documentAPI.upload(file);
      const { session_id } = response.data;
      
      navigate('/analysis', { state: { sessionId: session_id, filename: file.name } });
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Upload Contract Document</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{ marginBottom: '20px' }}
        />
        
        {file && (
          <p>Selected: {file.name}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{
            padding: '12px 24px',
            backgroundColor: uploading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            cursor: uploading || !file ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload & Analyze'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Supported formats: PDF, DOCX, JPG, PNG</p>
        <p>Maximum file size: 16MB</p>
      </div>
    </div>
  );
};

export default Upload;
