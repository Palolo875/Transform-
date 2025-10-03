'use client';

import { useState } from 'react';

const CatalystPOC = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [generator, setGenerator] = useState(null);

  return (
    <div>
      <h1>Catalyst Proof of Concept</h1>
    </div>
  );
};

export default CatalystPOC;