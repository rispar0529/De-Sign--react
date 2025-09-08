import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, filename } = location.state || {};
  
  const [analysis, setAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);
  const [clauseSuggestion, setClauseSuggestion] = useState(null);
  const [loading, setLoading] = useState({ verify: false, summarize: false, suggest: false });
  const [error, setError] = useState('');
  const [selectedClause, setSelectedClause] = useState('');
  const [riskyText, setRiskyText] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/upload');
    }
  }, [sessionId, navigate]);

  const handleVerifyContract = async () => {
    setLoading(prev => ({ ...prev, verify: true }));
    setError('');
    
    try {
      const response = await documentAPI.verifyContract(sessionId);
      setAnalysis(response.data.analysis);
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  };

  const handleSummarizeContract = async () => {
    setLoading(prev => ({ ...prev, summarize: true }));
    setError('');
    
    try {
      const response = await documentAPI.summarizeContract(sessionId);
      setSummary(response.data.summary);
    } catch (error) {
      setError(error.response?.data?.error || 'Summarization failed');
    } finally {
      setLoading(prev => ({ ...prev, summarize: false }));
    }
  };

  const handleSuggestClause = async () => {
    if (!selectedClause) {
      setError('Please enter a clause name');
      return;
    }
    
    setLoading(prev => ({ ...prev, suggest: true }));
    setError('');
    
    try {
      const response = await documentAPI.suggestClause(sessionId, selectedClause, riskyText);
      setClauseSuggestion(response.data.suggestion);
    } catch (error) {
      setError(error.response?.data?.error || 'Suggestion failed');
    } finally {
      setLoading(prev => ({ ...prev, suggest: false }));
    }
  };

  const handleApproval = async (approved) => {
    try {
      const response = await documentAPI.provideInput(sessionId, { approved });
      
      if (approved && response.data.waiting_for_input && response.data.input_type === 'meeting_date') {
        navigate('/meeting', { state: { sessionId, filename } });
      } else {
        alert(approved ? 'Process completed successfully!' : 'Process terminated.');
        navigate('/upload');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Approval failed');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <h2>Contract Analysis - {filename}</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button
          onClick={handleVerifyContract}
          disabled={loading.verify}
          style={{
            padding: '12px 24px',
            backgroundColor: loading.verify ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading.verify ? 'not-allowed' : 'pointer'
          }}
        >
          {loading.verify ? 'Verifying...' : 'Verify Contract'}
        </button>

        <button
          onClick={handleSummarizeContract}
          disabled={loading.summarize}
          style={{
            padding: '12px 24px',
            backgroundColor: loading.summarize ? '#6c757d' : '#17a2b8',
            color: 'white',
            border: 'none',
            cursor: loading.summarize ? 'not-allowed' : 'pointer'
          }}
        >
          {loading.summarize ? 'Summarizing...' : 'Summarize Contract'}
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Clause name"
            value={selectedClause}
            onChange={(e) => setSelectedClause(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Risky text (optional)"
            value={riskyText}
            onChange={(e) => setRiskyText(e.target.value)}
            style={{ padding: '8px' }}
          />
          <button
            onClick={handleSuggestClause}
            disabled={loading.suggest}
            style={{
              padding: '12px 24px',
              backgroundColor: loading.suggest ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              cursor: loading.suggest ? 'not-allowed' : 'pointer'
            }}
          >
            {loading.suggest ? 'Suggesting...' : 'Suggest Clause'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {analysis && (
          <div style={{ border: '1px solid #ddd', padding: '15px' }}>
            <h3>Contract Verification</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Array.isArray(analysis) ? (
                analysis.map((item, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                    <strong>{item.clause}:</strong> {item.status}
                    {item.issues && <div>Issues: {item.issues}</div>}
                  </div>
                ))
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(analysis, null, 2)}</pre>
              )}
            </div>
          </div>
        )}

        {summary && (
          <div style={{ border: '1px solid #ddd', padding: '15px' }}>
            <h3>Contract Summary</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <p>{summary}</p>
            </div>
          </div>
        )}

        {clauseSuggestion && (
          <div style={{ border: '1px solid #ddd', padding: '15px' }}>
            <h3>Clause Suggestion</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <p><strong>Clause:</strong> {selectedClause}</p>
              <p><strong>Suggestion:</strong> {clauseSuggestion}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px', textAlign: 'center' }}>
        <h3>Do you want to proceed with this contract?</h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => handleApproval(true)}
            style={{
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Yes, Proceed
          </button>
          <button
            onClick={() => handleApproval(false)}
            style={{
              padding: '15px 30px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            No, Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
