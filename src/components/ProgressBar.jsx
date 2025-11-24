import React from 'react';

export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">
          Progress
        </span>
        <span className="text-sm font-medium text-emerald-400">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {currentStep > 0 && currentStep < totalSteps && (
        <p className="text-xs text-slate-400 mt-2">
          Processing layer {currentStep} of {totalSteps}...
        </p>
      )}
      {currentStep === totalSteps && (
        <p className="text-xs text-emerald-400 mt-2 font-medium">
          ✓ Linguistic analysis complete!
        </p>
      )}
    </div>
  );
}
