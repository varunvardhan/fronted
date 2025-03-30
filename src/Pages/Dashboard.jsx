import React from "react";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from '../component/layout/MainLayout';
import ResumeUploadForm from '../component/resume/ResumeUploadForm';
import CandidateList from '../component/candidate/CandidateList';
import AnalysisResults from '../component/analysis/AnalysisResults';
import { useCandidateAnalysis } from '../hooks/useCandidateAnalysis';
import { useQuestions } from '../hooks/useQuestions';
import { useForm } from '../hooks/useForm';
import { useAnalysisResults } from '../hooks/useAnalysisResults';
import { useUI } from '../hooks/useUI';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useScroll } from '../hooks/useScroll';

const Dashboard = () => {
  // UI state
  const { isLoading, setIsLoading } = useUI();

  // Authentication
  const { handleLogout } = useAuth();

  // Toast notifications
  const { showToast } = useToast();

  // Scroll behavior
  const {
    candidatesListRef,
    middlePanelRef,
    scrollToTop,
    scrollToBottom,
    smoothScrollToBottom
  } = useScroll();

  // Form state
  const {
    jobDescription,
    setJobDescription,
    notes,
    setNotes,
    resume,
    setResume,
    errors,
    setErrors,
    validateForm,
    handleFileUpload,
    resetForm
  } = useForm();

  // Analysis state
  const {
    allResumeResults,
    selectedCandidateAnalysis,
    isFetchingAnalysis,
    disabledCandidates,
    processedCandidates,
    loading,
    responseMessage,
    handleAnalyze,
    handleCandidateClick
  } = useCandidateAnalysis();

  // Questions state
  const {
    beginnerQuestions,
    intermediateQuestions,
    expertQuestions,
    allEntries,
    activeTab,
    setActiveTab,
    showInstructions,
    setShowInstructions,
    hasQuestions,
    onAddQuestion,
    setQuestionsFromAnalysis
  } = useQuestions();

  // Analysis results state
  const {
    matchingText,
    matchingTextRightPanel,
    detailedComparison,
    updateAnalysisResults,
    resetAnalysisResults
  } = useAnalysisResults();

  // Show toast messages
  React.useEffect(() => {
    if (responseMessage) {
      showToast(responseMessage);
    }
  }, [responseMessage, showToast]);

  // Handle analyze button click
  const handleAnalyzeClick = async () => {
    setShowInstructions(false);
    resetAnalysisResults();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const results = await handleAnalyze(jobDescription, resume, notes);
      if (results.length > 0) {
        const first = results[0];
        updateAnalysisResults({
          Name: first.name,
          matching_score: first.matching_score,
          detailed_comparison: [{
            requirement: "Name",
            candidate_experience: first.name,
            evidence: "From resume metadata"
          }]
        });
        scrollToTop();
      }
    } catch (error) {
      showToast("Failed to analyze resumes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle candidate selection
  const handleCandidateSelect = async (candidate) => {
    try {
      const analysis = await handleCandidateClick(candidate);
      if (analysis) {
        updateAnalysisResults(analysis);
        setQuestionsFromAnalysis(analysis);
        smoothScrollToBottom();
      }
    } catch (error) {
      showToast("Failed to fetch candidate analysis", "error");
    }
  };

  return (
    <MainLayout onLogout={handleLogout}>
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Resume Upload Form */}
        <div className="col-span-4">
          <ResumeUploadForm
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            notes={notes}
            setNotes={setNotes}
            resume={resume}
            setResume={setResume}
            errors={errors}
            setErrors={setErrors}
            onFileUpload={handleFileUpload}
          />
          <button
            onClick={handleAnalyzeClick}
            disabled={loading || isLoading}
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading || isLoading ? "Analyzing..." : "Analyze Resumes"}
          </button>
        </div>

        {/* Middle Panel - Candidate List */}
        <div className="col-span-3">
          <CandidateList
            candidates={allResumeResults}
            selectedCandidate={selectedCandidateAnalysis}
            onCandidateClick={handleCandidateSelect}
            disabledCandidates={disabledCandidates}
            candidatesListRef={candidatesListRef}
          />
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="col-span-5">
          <AnalysisResults
            selectedCandidateAnalysis={selectedCandidateAnalysis}
            matchingText={matchingText}
            matchingTextRightPanel={matchingTextRightPanel}
            detailedComparison={detailedComparison}
            beginnerQuestions={beginnerQuestions}
            intermediateQuestions={intermediateQuestions}
            expertQuestions={expertQuestions}
            allEntries={allEntries}
            onAddQuestion={onAddQuestion}
            middlePanelRef={middlePanelRef}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showInstructions={showInstructions}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;