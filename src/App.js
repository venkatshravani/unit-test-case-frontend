import React, { useState } from 'react';
import { saveAs } from 'file-saver';

function App() {
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target.result);
      reader.readAsText(file);
    }
  };

  const generateTestCases = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setTestCases(data.testCases);
    } catch (error) {
      console.error('Error generating test cases:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Unit Test Case Generator</h1>
      
      <textarea
        value={code}
        onChange={handleCodeChange}
        placeholder="Paste your code here..."
        rows={12}
        cols={80}
      />

      <div>
        <input type="file" accept=".py,.js,.java,.txt" onChange={handleFileUpload} />
      </div>

      <button onClick={generateTestCases} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Test Cases'}
      </button>

      {testCases && (
        <div>
          <h2>Generated Test Cases</h2>
          <pre>{testCases}</pre>
          <button onClick={() => saveAs(new Blob([testCases], { type: 'text/plain' }), 'test-cases.txt')}>
            Save Test Cases
          </button>
        </div>
      )}
    </div>
  );
}

export default App;



