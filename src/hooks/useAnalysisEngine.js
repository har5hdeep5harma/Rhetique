import { useState, useCallback, useEffect } from 'react';
import { MASTER_PROMPT, ANALYSIS_STEPS } from '../data/masterPrompt';
import { callLLM } from '../utils/apiClients';

// Persist state to sessionStorage to survive HMR
const STORAGE_KEY = 'rhetorical-analysis-state';

function loadPersistedState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }
  return null;
}

function persistState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist state:', error);
  }
}

export function useAnalysisEngine() {
  // Try to restore state from sessionStorage on mount
  const persistedState = loadPersistedState();
  
  const [analysisResults, setAnalysisResults] = useState(persistedState?.analysisResults || []);
  const [currentStep, setCurrentStep] = useState(persistedState?.currentStep || 0);
  const [isLoading, setIsLoading] = useState(false); // Don't persist loading state
  const [error, setError] = useState(null); // Don't persist errors
  
  // Persist state changes to sessionStorage
  useEffect(() => {
    if (analysisResults.length > 0 || currentStep > 0) {
      persistState({ analysisResults, currentStep });
    }
  }, [analysisResults, currentStep]);

  const startAnalysis = useCallback(async (apiKey, apiService, oratorName, transcript) => {
    // Reset state
    setAnalysisResults([]);
    setCurrentStep(0);
    setError(null);
    setIsLoading(true);

    // Helper function to retry with exponential backoff
    const callWithRetry = async (apiService, apiKey, systemPrompt, userMessage, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await callLLM(apiService, apiKey, systemPrompt, userMessage);
        } catch (error) {
          // Check if it's a rate limit error
          const isRateLimit = error.message.includes('Rate limit') || error.message.includes('429');
          
          // Check if it's a daily limit (long wait time)
          const isDailyLimit = error.message.includes('tokens per day') || error.message.match(/try again in \d+m/);
          
          if (isDailyLimit) {
            // Don't retry for daily limits - throw immediately with helpful message
            throw new Error(
              `Daily API limit reached. ${error.message}\n\n` +
              `Suggestions:\n` +
              `1. Wait until tomorrow and try again\n` +
              `2. Switch to a different API provider (Gemini or OpenAI)\n` +
              `3. Upgrade your Groq account tier\n` +
              `4. Use a shorter transcript to reduce token usage`
            );
          }
          
          if (isRateLimit && attempt < maxRetries - 1) {
            // Extract wait time from error message if available (for per-minute limits)
            const waitMatch = error.message.match(/try again in ([\d.]+)s/);
            const waitTime = waitMatch ? parseFloat(waitMatch[1]) * 1000 : Math.pow(2, attempt) * 2000;
            
            console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime + 1000)); // Add 1 second buffer
            continue;
          }
          
          throw error;
        }
      }
    };

    try {
      // Process each step sequentially
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i + 1);
        
        const step = ANALYSIS_STEPS[i];
        const userMessage = `
Orator Name: ${oratorName}

Speech Transcript:
${transcript}

${step.instruction}
        `.trim();

        try {
          const result = await callWithRetry(apiService, apiKey, MASTER_PROMPT, userMessage);
          
          setAnalysisResults(prev => [...prev, {
            id: step.id,
            title: step.title,
            content: result,
            timestamp: new Date().toISOString()
          }]);
          
          // Longer delay between requests for Groq to avoid rate limiting
          if (i < ANALYSIS_STEPS.length - 1) {
            const delay = apiService === 'groq' ? 5000 : 2000; // 5 seconds for Groq, 2 for others
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (stepError) {
          throw new Error(`Failed at ${step.title}: ${stepError.message}`);
        }
      }
      
      setIsLoading(false);
      setCurrentStep(ANALYSIS_STEPS.length);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults([]);
    setCurrentStep(0);
    setError(null);
    setIsLoading(false);
    // Clear persisted state
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }, []);

  return {
    analysisResults,
    currentStep,
    isLoading,
    error,
    startAnalysis,
    resetAnalysis,
    totalSteps: ANALYSIS_STEPS.length
  };
}
