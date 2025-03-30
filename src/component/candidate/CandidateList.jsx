import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";

const CandidateList = ({ 
  candidates, 
  selectedCandidate, 
  onCandidateClick, 
  disabledCandidates,
  candidatesListRef 
}) => {
  return (
    <div 
      ref={candidatesListRef}
      className="bg-white shadow rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto"
    >
      <h2 className="text-lg font-semibold mb-4">Candidates</h2>
      <div className="space-y-2">
        {candidates.map((candidate) => (
          <div
            key={candidate.submissionId}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedCandidate?.submissionId === candidate.submissionId
                ? 'bg-indigo-50 border-indigo-500'
                : 'bg-gray-50 hover:bg-gray-100'
            } ${
              disabledCandidates.has(candidate.submissionId)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={() => !disabledCandidates.has(candidate.submissionId) && onCandidateClick(candidate)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{candidate.name}</h3>
                <p className="text-sm text-gray-500">{candidate.fileName}</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Score: {candidate.matching_score}%
                </span>
                {selectedCandidate?.submissionId === candidate.submissionId ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList; 