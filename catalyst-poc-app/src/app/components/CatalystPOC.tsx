'use client';

import { useState, useEffect, useRef } from 'react';
import { pipeline, Text2TextGenerationPipeline } from '@xenova/transformers';

const CatalystPOC = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('Awaiting model load');
  const [progress, setProgress] = useState(0);
  const [generator, setGenerator] = useState<Text2TextGenerationPipeline | null>(null);

  // We use a ref to prevent the effect from running twice in strict mode.
  const modelLoadingRef = useRef(false);

  useEffect(() => {
    if (modelLoadingRef.current) {
      return;
    }
    modelLoadingRef.current = true;

    const initializeModel = async () => {
      setStatus('Initialisation');

      // Initialize the text generation pipeline
      const newGenerator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
        progress_callback: (p: any) => {
          setStatus(p.status);
          setProgress(Math.round(p.progress));
        },
      });

      setGenerator(() => newGenerator);
      setStatus('Prêt');
    };

    initializeModel();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-8">Catalyst Proof of Concept</h1>

      {status !== 'Prêt' ? (
        <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold mb-2">{status}</p>
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full">
              <div
                className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl font-bold text-green-600">Model Ready!</p>
        </div>
      )}
    </div>
  );
};

export default CatalystPOC;