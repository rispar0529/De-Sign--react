import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

const Meeting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, filename } = location.state || {};
  
  const [meetingDate, setMeetingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleScheduleMeeting = async () => {
    if (!meetingDate) {
      setError('Please select a meeting date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await documentAPI.provideInput(sessionId, { meeting_date: meetingDate });
      
      if (response.data.workflow_complete) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/upload');
        }, 3000);
      } else {
        setError('Meeting scheduling failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Meeting scheduling failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUpload = () => {
    navigate('/upload');
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '20px', borderRadius: '5px' }}>
          <h2 style={{ color: '#155724' }}>✓ Success!</h2>
          <p>Meeting scheduled successfully for {new Date(meetingDate).toLocaleDateString()} at {new Date(meetingDate).toLocaleTimeString()}</p>
          <p>Contract processing workflow completed.</p>
          <p>Redirecting to upload page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h2>Schedule Meeting - {filename}</h2>
      <p>Your contract has been approved. Please schedule a meeting to finalize the process.</p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px' }}>
          Select Meeting Date & Time:
        </label>
        <input
          type="datetime-local"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={handleScheduleMeeting}
          disabled={loading || !meetingDate}
          style={{
            flex: 1,
            padding: '15px',
            backgroundColor: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            cursor: loading || !meetingDate ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Scheduling...' : 'Schedule Meeting'}
        </button>

        <button
          onClick={handleBackToUpload}
          style={{
            flex: 1,
            padding: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Upload
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
        <h4>Next Steps:</h4>
        <ul>
          <li>Meeting will be scheduled with relevant stakeholders</li>
          <li>Contract details will be reviewed in the meeting</li>
          <li>Final signing process will be completed</li>
          <li>You will receive confirmation via email</li>
        </ul>
      </div>
    </div>
  );
};

export default Meeting;
