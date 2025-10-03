'use client';

import { useState, useEffect, useRef } from 'react';
import { pipeline, Text2TextGenerationPipeline } from '@xenova/transformers';

const CatalystPOC = () => {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('Awaiting model load');
  const [progress, setProgress] = useState(0);
  const [generator, setGenerator] = useState<Text2TextGenerationPipeline | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

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
      setIsModelReady(true);
    };

    initializeModel();
  }, []);

  const handleSend = async () => {
    if (!generator || !userInput) {
      return;
    }

    setStatus('Réflexion');

    try {
      const prompt = `Réponds brièvement à la question suivante : ${userInput}`;
      const results = await generator(prompt, {
        max_new_tokens: 200,
        no_repeat_ngram_size: 3,
      });

      if (Array.isArray(results) && results.length > 0 && typeof results[0].generated_text === 'string') {
        setResponse(results[0].generated_text);
      } else {
        setResponse('Sorry, the model returned an unexpected response format.');
      }
    } catch (error) {
      console.error('Error during inference:', error);
      setResponse('An error occurred while generating the response.');
    } finally {
      setStatus('Prêt');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-8">Catalyst Proof of Concept</h1>

      {!isModelReady ? (
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
        <div className="w-full max-w-2xl">
          <div className="w-full p-4 bg-white rounded-lg shadow-md">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter your question here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              onClick={handleSend}
              disabled={status === 'Réflexion' || !userInput.trim()}
            >
              {status === 'Réflexion' ? 'Thinking...' : 'Send'}
            </button>
          </div>

          {status === 'Réflexion' && (
            <div className="w-full mt-6 p-4 bg-white rounded-lg shadow-md text-center">
              <p className="text-lg font-semibold">Réflexion...</p>
            </div>
          )}

          {response && (
            <div className="w-full mt-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-2">Response:</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalystPOC;