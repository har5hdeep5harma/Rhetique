import React from 'react';
import { ScrollText } from 'lucide-react';
import AnalysisCard from './AnalysisCard';

export default function ReportFeed({ analysisResults, isLoading }) {
  if (analysisResults.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ScrollText className="w-16 h-16 text-slate-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold text-slate-400 mb-2">
          Ready for Linguistic Analysis
        </h2>
        <p className="text-slate-500 max-w-md mb-4">
          Enter your Groq API key, orator name, and speech transcript, 
          then click "Analyze Speech" to begin comprehensive analysis.
        </p>
        <div className="text-xs text-slate-600 max-w-lg">
          <p className="font-semibold text-slate-500 mb-2">9 Integrated Analytical Layers:</p>
          <div className="grid grid-cols-1 gap-1 text-left">
            <p>• Phonetic–Phonological • Morpho–Lexical • Syntactic</p>
            <p>• Semantic • Pragmatic Intent • Classical Rhetoric</p>
            <p>• Cognitive Processing • Metarhetoric • Affective & Mnemonic</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-6 space-y-6">
      {analysisResults.map((analysis, index) => (
        <AnalysisCard key={analysis.id} analysis={analysis} index={index} />
      ))}
      
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" 
                   style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
