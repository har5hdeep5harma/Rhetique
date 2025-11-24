import React, { useState } from 'react';
import { Key, User, FileText, Play, Download, AlertCircle, RotateCcw } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function Sidebar({ 
  onStartAnalysis, 
  isLoading, 
  error, 
  currentStep, 
  totalSteps,
  onExportPDF,
  onReset,
  hasResults 
}) {
  const [apiKey, setApiKey] = useState('');
  const [oratorName, setOratorName] = useState('');
  const [transcript, setTranscript] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !oratorName.trim() || !transcript.trim()) {
      return;
    }
    onStartAnalysis(apiKey, 'groq', oratorName, transcript);
  };

  const isFormValid = apiKey.trim() && oratorName.trim() && transcript.trim();

  return (
    <div className="w-96 h-screen bg-slate-800 border-r border-slate-700 flex flex-col overflow-y-auto scrollbar-thin">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-800/50">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          Rhetique
        </h1>
        <p className="text-xs text-slate-500 mb-2">Linguistic Expert Edition</p>
        <p className="text-sm text-slate-400 mt-1">
          Professional linguistic & rhetorical analysis across 9 integrated layers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
        {/* API Key Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Key className="w-4 h-4" />
            Groq API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your Groq API key..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-2">
            Get your free API key at{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              console.groq.com/keys
            </a>
          </p>
        </div>

        {/* Orator Name Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <User className="w-4 h-4" />
            Orator Name
          </label>
          <input
            type="text"
            value={oratorName}
            onChange={(e) => setOratorName(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Martin Luther King Jr."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Transcript Input */}
        <div className="flex-1 flex flex-col">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <FileText className="w-4 h-4" />
            Speech Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isLoading}
            placeholder="Paste the speech transcript here..."
            rows={10}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none flex-1"
          />
          <p className="text-xs text-slate-500 mt-2">
            {transcript.length} characters
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Analysis Failed</p>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isLoading || currentStep > 0) && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Analyze Speech
              </>
            )}
          </button>

          {hasResults && !isLoading && (
            <>
              <button
                type="button"
                onClick={onExportPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-100 font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                Export to PDF
              </button>

              <button
                type="button"
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-slate-400 font-medium rounded-lg hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Analysis
              </button>
            </>
          )}
        </div>
      </form>

      <div className="p-6 border-t border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-500 text-center">
          Linguistic Expert Edition
        </p>
        
      </div>
    </div>
  );
}
