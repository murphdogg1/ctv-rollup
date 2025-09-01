'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [message, setMessage] = useState('Loading...');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    console.log('TestPage: JavaScript is executing!');
    setMessage('JavaScript is working!');
    setTimestamp(new Date().toISOString());
    
    // Test API call
    fetch('/api/campaigns')
      .then(response => response.json())
      .then(data => {
        console.log('API call successful:', data);
        setMessage(`API call successful! Found ${data.campaigns?.length || 0} campaigns`);
      })
      .catch(error => {
        console.error('API call failed:', error);
        setMessage(`API call failed: ${error.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JavaScript Test Page</h1>
      <p><strong>Status:</strong> {message}</p>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p><strong>Client:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
      <button onClick={() => alert('Button click works!')}>
        Test Button Click
      </button>
    </div>
  );
}
