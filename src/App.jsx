import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ReportFeed from './components/ReportFeed';
import { useAnalysisEngine } from './hooks/useAnalysisEngine';
import { generatePDF } from './utils/pdfExporter';

const INPUT_STORAGE_KEY = 'rhetorical-analysis-inputs';

function App() {
  // Try to restore inputs from sessionStorage
  const loadInputs = () => {
    try {
      const stored = sessionStorage.getItem(INPUT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load inputs:', error);
    }
    return { oratorName: '', transcript: '' };
  };

  const persistedInputs = loadInputs();
  const [oratorName, setOratorName] = useState(persistedInputs.oratorName);
  const [transcript, setTranscript] = useState(persistedInputs.transcript);
  
  // Persist inputs to sessionStorage
  useEffect(() => {
    if (oratorName || transcript) {
      try {
        sessionStorage.setItem(INPUT_STORAGE_KEY, JSON.stringify({ oratorName, transcript }));
      } catch (error) {
        console.warn('Failed to persist inputs:', error);
      }
    }
  }, [oratorName, transcript]);
  
  const {
    analysisResults,
    currentStep,
    isLoading,
    error,
    startAnalysis,
    resetAnalysis,
    totalSteps
  } = useAnalysisEngine();

  const handleStartAnalysis = (apiKey, apiService, name, text) => {
    setOratorName(name);
    setTranscript(text);
    startAnalysis(apiKey, apiService, name, text);
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(oratorName, transcript, analysisResults);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the analysis? This will clear all results.')) {
      resetAnalysis();
      setOratorName('');
      setTranscript('');
      // Clear persisted inputs
      try {
        sessionStorage.removeItem(INPUT_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear input storage:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      <Sidebar
        onStartAnalysis={handleStartAnalysis}
        isLoading={isLoading}
        error={error}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onExportPDF={handleExportPDF}
        onReset={handleReset}
        hasResults={analysisResults.length > 0}
      />
      
      <main className="flex-1 overflow-hidden">
        <ReportFeed
          analysisResults={analysisResults}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
