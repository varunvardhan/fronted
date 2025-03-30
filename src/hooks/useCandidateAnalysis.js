import { useState } from 'react';
import { analyzeResumesBulk, fetchCandidateAnalysis } from '../config/axios.config';
import { toast } from 'react-toastify';

export const useCandidateAnalysis = () => {
  const [allResumeResults, setAllResumeResults] = useState([]);
  const [selectedCandidateAnalysis, setSelectedCandidateAnalysis] = useState(null);
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
  const [disabledCandidates, setDisabledCandidates] = useState(new Set());
  const [processedCandidates, setProcessedCandidates] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleAnalyze = async (jobDescription, resume, notes) => {
    setLoading(true);
    setResponseMessage("");

    // Reset states
    setSelectedCandidateAnalysis(null);
    setProcessedCandidates(new Set());

    try {
      const result = await analyzeResumesBulk(jobDescription, resume, notes);

      if (result.success && Array.isArray(result.data?.results)) {
        const parsedResults = result.data.results.map((entry) => {
          let parsedAnalysis = {};
          try {
            parsedAnalysis = JSON.parse(entry.detailed_analysis || "{}");
          } catch (error) {
            console.error(`Failed to parse analysis for ${entry.resume_file}`, error);
          }
          return {
            fileName: entry.resume_file,
            submissionId: entry.submission_id,
            name: parsedAnalysis.Name || "Unknown",
            matching_score: parsedAnalysis.matching_score || 0,
            promptQuestions: [],
          };
        });

        const sortedResults = parsedResults.sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0));
        setAllResumeResults(sortedResults);
        setResponseMessage("Analysis completed successfully!");
        return sortedResults;
      } else {
        setResponseMessage("Analysis failed. Invalid response.");
        return [];
      }
    } catch (error) {
      console.error("Request error:", error);
      setResponseMessage("Failed to analyze. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateClick = async (candidate) => {
    if (processedCandidates.has(candidate.submissionId)) {
      setSelectedCandidateAnalysis(candidate);
      return;
    }

    setDisabledCandidates((prev) => new Set(prev).add(candidate.submissionId));
    setIsFetchingAnalysis(true);

    try {
      const analysis = await fetchCandidateAnalysis(candidate.submissionId);
      if (analysis.success) {
        const parsedAnalysis = JSON.parse(analysis.data.detailed_analysis);
        setSelectedCandidateAnalysis(parsedAnalysis);
        setProcessedCandidates((prev) => new Set(prev).add(candidate.submissionId));
        return parsedAnalysis;
      }
      return null;
    } catch (error) {
      console.error("Error fetching candidate analysis:", error);
      toast.error("Failed to fetch candidate analysis");
      return null;
    } finally {
      setIsFetchingAnalysis(false);
      setDisabledCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidate.submissionId);
        return newSet;
      });
    }
  };

  return {
    allResumeResults,
    selectedCandidateAnalysis,
    isFetchingAnalysis,
    disabledCandidates,
    processedCandidates,
    loading,
    responseMessage,
    handleAnalyze,
    handleCandidateClick
  };
}; 