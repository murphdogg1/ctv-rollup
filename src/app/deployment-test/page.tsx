'use client';

import { useState, useEffect } from 'react';

export default function DeploymentTest() {
  const [status, setStatus] = useState('Loading...');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setStatus('✅ DEPLOYMENT TEST - JavaScript is working!');
    setTimestamp(new Date().toISOString());
    console.log('DeploymentTest: JavaScript executing at', new Date().toISOString());
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 DEPLOYMENT TEST PAGE</h1>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p><strong>Build ID:</strong> {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'Unknown'}</p>
      <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      <p><strong>Client:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
        <h3>✅ If you can see this, the deployment is working!</h3>
        <p>This page was deployed at: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
