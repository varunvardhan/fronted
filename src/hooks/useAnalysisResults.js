import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAnalysisResults = () => {
  const [matchingText, setMatchingText] = useState("");
  const [matchingTextRightPanel, setMatchingTextRightPanel] = useState("");
  const [detailedComparison, setDetailedComparison] = useState([]);
  const [missingText, setMissingText] = useState("");
  const [additionalText, setAdditionalText] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const updateAnalysisResults = (analysis) => {
    if (analysis) {
      setMatchingText(`Candidate: ${analysis.Name}`);
      setMatchingTextRightPanel(`Matching Score: ${analysis.matching_score}`);
      setDetailedComparison(analysis.detailed_comparison || []);
      setShowMatching(true);
      
      // Update missing and additional areas if available
      if (analysis.missing_areas) {
        setMissingText(analysis.missing_areas.join(", "));
        setShowMissing(true);
      }
      if (analysis.additional_areas) {
        setAdditionalText(analysis.additional_areas.join(", "));
        setShowAdditional(true);
      }
    }
  };

  const resetAnalysisResults = () => {
    setMatchingText("");
    setMatchingTextRightPanel("");
    setDetailedComparison([]);
    setMissingText("");
    setAdditionalText("");
    setShowMatching(false);
    setShowMissing(false);
    setShowAdditional(false);
  };

  return {
    matchingText,
    matchingTextRightPanel,
    detailedComparison,
    missingText,
    additionalText,
    showMatching,
    showMissing,
    showAdditional,
    updateAnalysisResults,
    resetAnalysisResults
  };
}; 