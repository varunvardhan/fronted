import React, { useState, useEffect, useRef } from "react";
import { LogOut, ExternalLink, FileText, Download, AlertTriangle, Loader2 } from "lucide-react";
import { analyzeResumesBulk } from '/src/config/axios.config.js';
import { fetchResumeFromApi } from '/src/config/axios.config.js';
import { fetchCandidateAnalysis } from '/src/config/axios.config.js';
import { useNavigate } from "react-router-dom";
import { removeUserData } from "../Helper/LocalStorageHelper.js";
import { INSTRUCTIONS } from "../config/constants.jsx";
import QuestionComponent from '../component/QuestionComponent.jsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Dashboard = () => {
  const navigate = useNavigate();

  // State declarations
  const [matchingText, setMatchingText] = useState("");
  const [detailedComparison, setDetailedComparison] = useState([]);
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
  const [beginnerQuestions, setBeginnerQuestions] = useState([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState([]);
  const [expertQuestions, setExpertQuestions] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [errors, setErrors] = useState({});
  const [allResumeResults, setAllResumeResults] = useState([]);
  const [selectedCandidateAnalysis, setSelectedCandidateAnalysis] = useState(null);
  const [disabledCandidates, setDisabledCandidates] = useState(new Set());
  const [processedCandidates, setProcessedCandidates] = useState(new Set());
  const [activeTab, setActiveTab] = useState("QA");
  const [currentCandidateId, setCurrentCandidateId] = useState(null);
  const [resumePreviewInfo, setResumePreviewInfo] = useState(null);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumeCache, setResumeCache] = useState({});
  const [currentCandidate, setCurrentCandidate] = useState(null); // Track selected candidate
  const [showTabs, setShowTabs] = useState(false); // Control tab visibility
  const [cv_notes, setCvNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortController, setAbortController] = useState(new AbortController());

  // Refs
  const candidatesListRef = useRef(null);
  const resultsHeaderRef = useRef(null);
  const middlePanelRef = useRef(null);
  const questionInputRef = useRef(null);


  const handleReset = () => {
    // Clear all state variables
    abortController.abort();
    setAbortController(new AbortController());
    setIsProcessing(false);
    setLoading(false);
    setResponseMessage("Analysis stopped by user");
    setDisabledCandidates(new Set());
    setProgress(0);
    setMatchingText("");
    setDetailedComparison([]);
    setBeginnerQuestions([]);
    setIntermediateQuestions([]);
    setExpertQuestions([]);
    setAllEntries([]);
    setJobDescription("");
    setNotes("");
    setResume(null);
    setResponseMessage("");
    setAllResumeResults([]);
    setSelectedCandidateAnalysis(null);
    setCurrentCandidateId(null);
    setProcessedCandidates(new Set());
    setDisabledCandidates(new Set());
    setActiveTab("QA");
    setResumePreviewInfo(null);
    setCurrentCandidate(null);
    setShowTabs(false);
    setCvNotes("");
    setProgress(0);
    
    // Clear file input
    const fileInput = document.getElementById('resumeUpload');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Show instructions again
    setShowInstructions(true);
    
    // Clear any errors
    setErrors({});
    
    // Clear local storage cache for this session
    allResumeResults.forEach(result => {
      localStorage.removeItem(`analysis_${result.submissionId}`);
      localStorage.removeItem(`resume_${result.submissionId}`);
    });
    
    // Revoke any blob URLs
    allResumeResults.forEach(result => {
      const cachedResume = JSON.parse(localStorage.getItem(`resume_${result.submissionId}`));
      if (cachedResume?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(cachedResume.url);
      }
    });
    
    toast.success("All data has been reset", {
      position: "top-center",
      autoClose: 2000,
    });
  };

  // Auto scroll left panel
  useEffect(() => {
    if (allResumeResults.length > 0 && !loading) {
      const timer = setTimeout(() => {
        const container = candidatesListRef.current;
        const resultsSection = resultsHeaderRef.current;
        if (container && resultsSection) {
          // Calculate position to scroll to
          const scrollPosition = resultsSection.offsetTop - container.offsetTop - 20;
          // Smooth scroll
          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [allResumeResults.length, loading]);
  
  // Auto-scroll effects
  /*
  useEffect(() => {
    if (middlePanelRef.current && (beginnerQuestions.length > 0 || intermediateQuestions.length > 0 || expertQuestions.length > 0 || allEntries.length > 0)) {
      middlePanelRef.current.scrollTop = middlePanelRef.current.scrollHeight;
    }
  }, [beginnerQuestions, intermediateQuestions, expertQuestions, allEntries]);

  useEffect(() => {
    if (allResumeResults.length > 0 && candidatesListRef.current) {
      if (!currentCandidateId) {
        candidatesListRef.current.scrollTop = 0;
      }
    }
  }, [allResumeResults, currentCandidateId]);
*/
  useEffect(() => {
    if (responseMessage) {
      toast.success(responseMessage, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [responseMessage]);

  const validateForm = () => {
    if (!jobDescription.trim()) {
      alert("Job description is required.");
      return false;
    }
    if (!resume) {
      alert("Resume is required.");
      return false;
    }
    return true;
  };

  const hasQuestions = () => {
    return (
      beginnerQuestions.length > 0 ||
      intermediateQuestions.length > 0 ||
      expertQuestions.length > 0
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Resume" && currentCandidateId) {
      // Clear previous resume preview when switching candidates
      setResumePreviewInfo(null);
      loadResumePreview(currentCandidateId);
    }
  };

  const loadResumePreview = async (submissionId) => {
    if (!submissionId) return;
  
    // First check in-memory cache
    if (resumeCache[submissionId] && !resumeCache[submissionId].error) {
      setResumePreviewInfo(resumeCache[submissionId]);
      return;
    }
  
    // Then check localStorage
    const cachedResume = JSON.parse(localStorage.getItem(`resume_${submissionId}`));
    if (cachedResume && !cachedResume.error) {
      setResumeCache(prev => ({ ...prev, [submissionId]: cachedResume }));
      setResumePreviewInfo(cachedResume);
      return;
    }
  
    setIsResumeLoading(true);
    
    try {
      const response = await fetchResumeFromApi(submissionId);
      
      if (response.error) throw new Error(response.message);
  
      const resumeData = {
        url: response.url,
        type: response.type,
        name: response.name,
        error: false,
        lastFetched: Date.now()
      };
  
      // Update both caches
      localStorage.setItem(`resume_${submissionId}`, JSON.stringify(resumeData));
      setResumeCache(prev => ({ ...prev, [submissionId]: resumeData }));
      setResumePreviewInfo(resumeData);
      
    } catch (error) {
      const fallbackInfo = {
        url: '/placeholder-resume.png',
        type: 'image/png',
        name: 'Resume Not Available.png',
        error: true,
        errorMessage: error.message
      };
      
      localStorage.setItem(`resume_${submissionId}`, JSON.stringify(fallbackInfo));
      setResumeCache(prev => ({ ...prev, [submissionId]: fallbackInfo }));
      setResumePreviewInfo(fallbackInfo);
      
    } finally {
      setIsResumeLoading(false);
    }
  };
  

  useEffect(() => {
    return () => {
      // Clean up blob URLs when component unmounts
      allResumeResults.forEach(result => {
        const cachedResume = JSON.parse(localStorage.getItem(`resume_${result.submissionId}`));
        if (cachedResume?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(cachedResume.url);
        }
      });
    };
  }, [allResumeResults]);

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      ".pdf", ".doc", ".docx" // Add extensions for broader compatibility
    ];
    
    try {
      const invalidFiles = files.filter(file => 
        !allowedTypes.includes(file.type) && 
        !allowedTypes.some(ext => file.name.toLowerCase().endsWith(ext))
      );
      
      if (invalidFiles.length > 0) {
        setErrors(prev => ({ ...prev, resume: "Only PDF, DOC, and DOCX files are allowed." }));
        event.target.value = ""; // Clear invalid selection
        return;
      }
      
      setErrors(prev => ({ ...prev, resume: "" }));
      setResume(files);
    } catch (error) {
      setErrors(prev => ({ ...prev, resume: error.message }));
      setResume(null);
      event.target.value = "";
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    removeUserData();
    navigate("/");
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setProgress(5); 
    setResponseMessage("");
    setSelectedCandidateAnalysis(null);
    setMatchingText("");
    setDetailedComparison([]);
    setBeginnerQuestions([]);
    setIntermediateQuestions([]);
    setExpertQuestions([]);
    setAllEntries([]);
    setCurrentCandidateId(null);
    setProcessedCandidates(new Set());
    setAllResumeResults([]);
    setResumePreviewInfo(null);
    setActiveTab("QA");
    setCurrentCandidate(null);
    setShowTabs(false);

    const controller = new AbortController();
    setAbortController(controller);
    setIsProcessing(true);
    setProgress(5);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const batchSize = 2;
      let allResults = [];
      const totalResumes = resume.length;
      const progressIncrement = 90 / totalResumes; // Reserve 5% for completion
      
      // Initial processing message
      setResponseMessage("Starting analysis...");
      
      const resumeBatches = [];
      for (let i = 0; i < totalResumes; i += batchSize) {
        resumeBatches.push(resume.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < resumeBatches.length; batchIndex++) {
        if (controller.signal.aborted) {
          setResponseMessage("Analysis stopped by user");
          return;
        }
     
        const batch = resumeBatches[batchIndex];
        const batchResult = await analyzeResumesBulk(jobDescription, batch, notes, cv_notes, {
          signal: controller.signal
        });
        
        if (!batchResult.success) {
          let errorMessage = batchResult.message;
          
          if (batchResult.errorType === "network") {
            errorMessage = "Network error: Please check your internet connection";
          } else if (batchResult.errorType === "authentication") {
            navigate("/login");
            return;
          }
          
          setResponseMessage(errorMessage);
          toast.error(errorMessage);
          return;
        }

        if (Array.isArray(batchResult.data?.results)) {
          for (const entry of batchResult.data.results) {
            let parsedAnalysis = {};
            try {
              parsedAnalysis = JSON.parse(entry.detailed_analysis || "{}");
            } catch (error) {
              console.error(`Failed to parse analysis for ${entry.resume_file}`, error);
            }
            
            const processedResult = {
              fileName: entry.resume_file,
              submissionId: entry.submission_id,
              name: parsedAnalysis.Name || "Unknown",
              matching_score: parsedAnalysis.matching_score || 0,
              promptQuestions: [],
            };

            allResults = [...allResults, processedResult];
            const currentProgress = Math.floor((allResults.length / totalResumes) * 100);
            setProgress(currentProgress);
            setResponseMessage(`Processing... ${allResults.length}/${totalResumes} resumes completed`);

            setMatchingText(`Candidate: ${processedResult.name}`);
            setDetailedComparison([{
              requirement: "Name",
              candidate_experience: processedResult.name,
              evidence: "From resume metadata"
            }]);
            
            setShowInstructions(false);

            const sortedResults = [...allResults].sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0));
            setAllResumeResults(sortedResults);
          }
        } else {
          setResponseMessage("Invalid analysis data format in batch");
          break;
        }
      }

      if (allResults.length > 0) {
        // Complete the progress
        setProgress(100);
        setResponseMessage(`Analysis completed successfully! Processed ${allResults.length} resumes.`);
        toast.success(`Processed ${allResults.length} resumes`);
        setProgress(100);
          // Scroll the left panel after a small delay to ensure the DOM has updated
          setTimeout(() => {
            if (candidatesListRef.current) {
              candidatesListRef.current.scrollTo({
                top: candidatesListRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 300);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setResponseMessage("Analysis stopped successfully");
        toast.info("Analysis stopped successfully");
      } else {
      console.error("Unexpected error:", error);
      setResponseMessage("An unexpected error occurred during batch processing");
      toast.error("An unexpected error occurred during batch processing");
      }
    } finally {
      setIsProcessing(false);
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleCandidateClick = async (candidate) => {
    // Always switch to Q&A tab when clicking a candidate
    setActiveTab("QA");
    
    
    
    // If already processed, just display the cached data
    if (processedCandidates.has(candidate.submissionId)) {
      setCurrentCandidateId(candidate.submissionId);
      const cachedAnalysis = localStorage.getItem(`analysis_${candidate.submissionId}`);
      if (cachedAnalysis) {
        try {
          const parsedData = JSON.parse(cachedAnalysis);
          processSuccessfulResponse(parsedData, candidate);
          
        } catch (e) {
          console.warn('Failed to parse cached analysis', e);
        }
      }
      return;
    }

    // Check local storage first
    const cachedAnalysis = localStorage.getItem(`analysis_${candidate.submissionId}`);
    if (cachedAnalysis) {
      try {
        const parsedData = JSON.parse(cachedAnalysis);
        if (isValidAnalysisData(parsedData)) {
          processSuccessfulResponse(parsedData, candidate);
          return;
        }
      } catch (e) {
        console.warn('[Cache] Failed to parse cached data, proceeding with API call', e);
      }
    }

    // Lock this specific candidate
    setDisabledCandidates(prev => new Set(prev).add(candidate.submissionId));
    setIsFetchingAnalysis(true);
    setCurrentCandidateId(candidate.submissionId);

    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000;
    const MAX_DELAY_MS = 10000;
    let retryCount = 0;
    let lastError = null;

    const getDelay = (attempt) => {
      const exponentialDelay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
      const jitter = exponentialDelay * 0.2 * Math.random();
      return exponentialDelay + jitter;
    };

    const isValidAnalysisData = (data) => {
      if (data?.error) return false;
      if (!data?.ai_analysis) return false;
      return true;
    };

    const executeAnalysis = async () => {
      try {
        const result = await fetchCandidateAnalysis(candidate.submissionId);
        
        if (result.data?.error) {
          return {
            shouldRetry: result.data.error.includes('try again'),
            error: result.data.error
          };
        }
        
        if (!result.success) {
          lastError = result.message;
          
          if (result.errorType === "network") {
            lastError = "Network error: Please check your connection";
            return { shouldRetry: true, error: lastError };
          } 
          if (result.errorType === "authentication") {
            navigate("/login");
            return { shouldRetry: false };
          }
          
          return { shouldRetry: false, error: lastError };
        }

        return { shouldRetry: false, data: result.data };
      } catch (error) {
        return { shouldRetry: true, error: "An unexpected error occurred" };
      }
    };

    while (retryCount < MAX_RETRIES) {
      const { shouldRetry, error, data } = await executeAnalysis();
      
      if (!shouldRetry) {
        if (data) {
          try {
            localStorage.setItem(`analysis_${candidate.submissionId}`, JSON.stringify(data));
          } catch (e) {
            console.warn('[Cache] Failed to store analysis result', e);
          }
          
          processSuccessfulResponse(data, candidate);
          
          if (data.error) {
            toast.warning(`Analysis completed with warnings: ${data.error}`);
          }
        } else {
          toast.error(error || "Analysis failed");
        }
        break;
      }
      
      if (retryCount < MAX_RETRIES - 1) {
        const delay = getDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      } else {
        toast.error(error || "Analysis failed after multiple attempts");
        break;
      }
    }

    setIsFetchingAnalysis(false);
    setDisabledCandidates(prev => {
      const updated = new Set(prev);
      updated.delete(candidate.submissionId);
      return updated;
    });
  };

  const DocumentFallback = ({ url, name, isPdf }) => (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <p className="text-gray-600 mb-4">
        {isPdf 
          ? "PDF viewer not available in your browser"
          : "Could not load document preview"}
      </p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        download={name}
      >
        Download {isPdf ? 'PDF' : 'Document'}
      </a>
    </div>
  );

  const UnsupportedFileFallback = ({ url, name }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
      <FileText className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-500 mb-4">Preview not available for this file type</p>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        download={name}
      >
        <Download className="mr-2 inline" size={16} />
        Download File
      </a>
    </div>
  );

  const processSuccessfulResponse = (data, candidate) => {
    if (!data?.ai_analysis) return;

    setCurrentCandidateId(candidate.submissionId);
    setProcessedCandidates(prev => new Set(prev).add(candidate.submissionId));
    
    const aiAnalysis = data.ai_analysis;
    setMatchingText(`Candidate: ${candidate.name}`);
    setSelectedCandidateAnalysis(aiAnalysis);
    setCurrentCandidate(candidate);
    setShowTabs(true);

    setDetailedComparison(
      (aiAnalysis.detailed_comparison || []).map((item) => ({
        requirement: item.requirement || "Not specified",
        candidate_experience: item.candidate_experience || "Not found",
        evidence: "From resume analysis",
      }))
    );

    const screeningQuestions = aiAnalysis.screening_questions || {};
    setBeginnerQuestions(screeningQuestions.beginner || []);
    setIntermediateQuestions(screeningQuestions.intermediate || []);
    setExpertQuestions(screeningQuestions.expert || []);

    setAllEntries(candidate.promptQuestions || []);
    questionInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onAddQuestion = (question, level, answer) => {
    const newEntry = { question, answer, level };
    setAllEntries((prev) => [...prev, newEntry]);
  
    if (currentCandidateId) {
      setAllResumeResults((prevResults) =>
        prevResults.map((candidate) =>
          candidate.submissionId === currentCandidateId
            ? { 
                ...candidate, 
                promptQuestions: [...(candidate.promptQuestions || []), newEntry]
              }
            : candidate
        )
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-200 md:p-1">
         {/* Left Panel */}
         <div className="w-full md:w-1/4 bg-white p-4 flex flex-col gap-4 h-[calc(100vh-20px)] overflow-y-auto" ref={candidatesListRef}>
     {/* Job Description */}
     <div className="space-y-2">
       <span className="font-bold text-xl">Job Description</span>
       <textarea
         className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
         placeholder="Paste job description here..."
         value={jobDescription}
         onChange={(e) => {
           setJobDescription(e.target.value);
           setErrors((prev) => ({ ...prev, jobDescription: "" }));
         }}
       />
     </div>
   
     {/* Resume Upload */}
     <div className="space-y-2">
       <span className="font-bold text-xl">Attach Resume</span>
       <p className="text-sm text-gray-500">(PDF, DOC, DOCX - Max 5MB each)</p>
       <div className="relative">
         <input
           type="file"
           id="resumeUpload"
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
           accept=".pdf,.doc,.docx"
           multiple
           onChange={handleUpload}
         />
         <div className="flex items-center justify-between p-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
           <span className="text-gray-500 truncate">
             {resume ? `${resume.length} file(s) selected` : "No file chosen"}
           </span>
           <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
             Browse
           </button>
         </div>
       </div>
       {errors.resume && (
         <p className="text-sm text-red-500 mt-1">{errors.resume}</p>
       )}
     </div>
   
     {/* CV Scoring Notes */}
     <div className="space-y-2">
       <span className="font-bold text-xl">CV Scoring Notes</span>
       <p className="text-sm text-gray-500">Keywords for scoring</p>
       <textarea
         className="w-full h-28 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
         placeholder="Enter scoring keywords..."
         value={cv_notes}
         onChange={(e) => setCvNotes(e.target.value)}
       />
     </div>
   
     {/* Additional Notes */}
     <div className="space-y-2">
       <span className="font-bold text-xl">Additional Notes</span>
       <p className="text-sm text-gray-500">Optional comments</p>
       <textarea
         className="w-full h-28 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
         placeholder="Add any additional notes..."
         value={notes}
         onChange={(e) => setNotes(e.target.value)}
       />
     </div>
   
     {/* Progress Bar */}
     {(loading || progress > 0) && (
       <div className="space-y-2 pt-2">
         <div className="w-full bg-gray-200 rounded-full h-2">
           <div 
             className="bg-blue-600 h-2 rounded-full" 
             style={{ width: `${progress}%` }}
           ></div>
         </div>
         {loading && (
           <p className="text-sm text-gray-500 text-center">
             Processing {Math.floor(progress)}%...
           </p>
         )}
       </div>
     )}
   
     {/* Action Buttons */}
     <div className="flex gap-3 pt-2">
       <button
         className="flex-1 bg-red-600 h-10 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
         onClick={handleAnalyze}
         disabled={loading}
       >
         {loading ? (
           <Loader2 className="h-4 w-4 animate-spin mr-2" />
         ) : null}
         {loading ? "Analyzing" : "Analyze"}
       </button>
       <button
         className="flex-1 bg-gray-500 h-10 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-600 disabled:opacity-50"
         onClick={handleReset}
         disabled={loading}
       >
         Reset
       </button>
     </div>
   
   {/* Results Section */}
   {allResumeResults.length > 0 && (
     <div className="mt-6 space-y-4">
       <h3 className="font-bold text-xl text-gray-800">Results ({allResumeResults.length})</h3>
       <ul className="space-y-3">
         {allResumeResults.map((result, index) => {
           const isProcessed = processedCandidates.has(result.submissionId);
           const isProcessing = disabledCandidates.has(result.submissionId);
           const score = result.matching_score;
           const normalizedScore = Math.min(Math.max(score, 0), 100);
   
           return (
             <li
               key={index}
               className={`p-4 border rounded-xl transition-all flex items-center gap-4 ${
                 isProcessing
                   ? "bg-gray-50 cursor-not-allowed border-gray-200"
                   : "bg-white hover:bg-gray-50 cursor-pointer border-gray-200"
               }`}
               onClick={() => !isProcessing && handleCandidateClick(result)}
             >
               {/* Animated Circular Progress Score */}
               <div className="relative w-14 h-14 flex-shrink-0">
                 <svg 
                   className={`w-full h-full ${isProcessing ? "animate-spin" : ""}`}
                   viewBox="0 0 36 36"
                   style={{ animationDuration: "2s" }}
                 >
                   {/* Background circle - shows only when not processed */}
                   {!isProcessed && (
                     <path
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       fill="none"
                       stroke="#e5e7eb"
                       strokeWidth="3"
                     />
                   )}
                   {/* Processing indicator - partial gray arc */}
                   {isProcessing && (
                     <path
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       fill="none"
                       stroke="#9ca3af"
                       strokeWidth="3"
                       strokeDasharray="20, 100"
                       strokeLinecap="round"
                     />
                   )}
                   {/* Completed circle - full blue arc when processed */}
                   {isProcessed && (
                     <path
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       fill="none"
                       stroke="#3b82f6"
                       strokeWidth="3"
                     />
                   )}
                   {/* Score progress arc - shows when ready (not processing) */}
                   {!isProcessing && !isProcessed && (
                     <path
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       fill="none"
                       stroke="#3b82f6"
                       strokeWidth="3"
                       strokeDasharray={`${normalizedScore}, 100`}
                       strokeLinecap="round"
                     />
                   )}
                 </svg>
                 <div className={`absolute inset-0 flex items-center justify-center font-semibold ${
                   isProcessing ? 'text-gray-600' : 
                   isProcessed ? 'text-blue-600' : 'text-blue-600'
                 }`}>
                   {score}
                 </div>
               </div>
   
               {/* Candidate Info */}
               <div className="flex-1 min-w-0">
                 <p className="font-medium text-gray-900 truncate">{result.name}</p>
                 <p className="text-gray-500 text-sm truncate">{result.fileName}</p>
               </div>
   
               {/* Status Indicator */}
               <div className="flex items-center ml-2">
                 <div className="flex flex-col items-center">
                   <div className="w-2.5 h-2.5 rounded-full mb-1" style={{
                     backgroundColor: isProcessing 
                       ? '#ef4444' 
                       : isProcessed 
                         ? '#22c55e' 
                         : '#9ca3af'
                   }}></div>
                   <span className="text-xs text-gray-500">
                     {isProcessing ? 'Processing' : isProcessed ? 'Processed' : 'Pending'}
                   </span>
                 </div>
               </div>
             </li>
           );
         })}
       </ul>
     </div>
)}
</div>

      {/* Middle Panel */}
      <div className="w-full md:w-3/5 bg-white p-4 md:p-1 shadow-lg rounded-xl mt-2 md:mt-0 md:ml-1 flex flex-col border border-gray-200 h-[calc(100vh-20px)]"
        style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "cover" }}
        ref={middlePanelRef} 
      >
        <div className="bg-white text-black p-2 rounded-t-sm flex justify-between items-center border-b shadow-md sticky top-0">
          <span className="font-bold text-xl">BMI CoPanelist Chat</span>
          <button
            className="text-red-500 flex items-center hover:text-red-700 transition duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" size={24} /> Logout
          </button>
        </div>

        <div className="flex space-x-2 bg-white-100 rounded-lg px-3 py-2">
        {currentCandidate && (
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-bold text-gray-800">{currentCandidate.name} : </h2>
            </div>
          )}
          {showTabs && (
            <>
              <button
                className={`px-4 py-2 mt-2 text-sm rounded-md transition-all duration-200 ${
                  activeTab === "QA"
                    ? "bg-blue-500 text-white font-bold"
                    : "bg-blue-500 text-white hover:bg-blue-300"
                }`}
                onClick={() => handleTabChange("QA")}
              >
                Q&A
              </button>
              <button
                className={`px-4 py-2 mt-2 text-sm rounded-md transition-all duration-200 ${
                  activeTab === "Matching Details"
                    ? "bg-blue-500 text-white font-bold"
                    : "bg-blue-500 text-white hover:bg-blue-300"
                }`}
                onClick={() => handleTabChange("Matching Details")}
              >
                JD vs CV Summary Details
              </button>
              <button
                className={`px-4 py-2 mt-2 text-sm rounded-md transition-all duration-200 ${
                  activeTab === "Resume"
                    ? "bg-blue-500 text-white font-bold"
                    : "bg-blue-500 text-white hover:bg-blue-300"
                }`}
                onClick={() => handleTabChange("Resume")}
              >
                Resume
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === "QA" ? (
            <>
              {beginnerQuestions.map((item, index) => (
                <div key={`beginner-${index}`} className="rounded-lg bg-green-50 p-2 mb-1 shadow-sm">
                  <div className="text-green-900 font-semibold italic text-lg">
                    BQ: {item.question}
                  </div>
                  <div className="text-green-800 font-medium text-lg mt-1">
                    Answer: {item.answer}
                  </div>
                </div>
              ))}

              {intermediateQuestions.map((item, index) => (
                <div key={`intermediate-${index}`} className="rounded-lg bg-blue-50 p-2 mb-1 shadow-sm">
                  <div className="text-blue-900 italic font-medium text-lg">
                    IQ: {item.question}
                  </div>
                  <div className="text-blue-800 font-medium text-lg mt-1">
                    Answer: {item.answer}
                  </div>
                </div>
              ))}

              {expertQuestions.map((item, index) => (
                <div key={`expert-${index}`} className="rounded-lg bg-amber-50 p-2 mb-1 shadow-sm">
                  <div className="text-[#5A3E1B] italic font-medium text-lg">
                    EQ: {item.question}
                  </div>
                  <div className="text-[#5A3E1B] font-medium text-lg mt-1">
                    Answer: {item.answer}
                  </div>
                </div>
              ))}

              {allEntries.map((item, index) => (
                <div
                  key={`entry-${index}`}
                  className={`rounded-lg p-2 mb-1 shadow-sm ${
                    item.level === "Beginner"
                      ? "bg-green-50"
                      : item.level === "Intermediate"
                      ? "bg-blue-50"
                      : item.level === "Expert"
                      ? "bg-amber-50"
                      : "bg-gray-100"
                  }`}
                >
                  <div className={`italic font-medium text-lg ${
                    item.level === "Beginner"
                      ? "text-green-950"
                      : item.level === "Intermediate"
                      ? "text-blue-950"
                      : item.level === "Expert"
                      ? "text-[#8B4513]"
                      : "text-black"
                  }`}
                  >
                    {item.level === "Beginner"
                      ? "BQ"
                      : item.level === "Intermediate"
                      ? "IQ"
                      : item.level === "Expert"
                      ? "EQ"
                      : "Prompt"}
                    : {item.question}
                  </div>

                  {item.level !== "Prompt" && (
                    <div className={`font-medium text-lg ${
                      item.level === "Beginner"
                        ? "text-green-950"
                        : item.level === "Intermediate"
                        ? "text-blue-950"
                        : "text-[#8B4513]"
                    }`}
                    >
                      Answer: {item.answer}
                    </div>
                  )}

                  {item.level === "Prompt" && item.answer && (
                    <div className="text-black font-medium text-lg mt-1">
                      Answer: {item.answer}
                    </div>
                  )}
                </div>
              ))}
              <div ref={questionInputRef} />
              {showInstructions && INSTRUCTIONS.getContent()}
            </>
          ) : activeTab === "Matching Details" ? (
            <div>
              {hasQuestions() && (
                <div className="mb-6 space-y-6">
                  <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-2xl font-semibold text--500 flex items-center mb-4">
                      JD Required Skills vs Candidate's Relevant Experience
                    </h3>

                    <div className="bg-gray-100 p-4 mt-5 rounded-2xl text-black text-lg leading-relaxed whitespace-pre-line shadow-inner">
                      {detailedComparison.length > 0 ? (
                        detailedComparison.map((item, index) => (
                          <div key={index} className="mb-2">
                            <strong>{item.requirement}</strong> - {item.candidate_experience}
                            {item.evidence && <p className="text-sm text-gray-600">{item.evidence}</p>}
                          </div>
                        ))
                      ) : (
                        <p>No matching areas found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "Resume" && currentCandidateId && (
            <div className="h-full flex flex-col bg-white rounded-lg">
              {isResumeLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Loading PDF resume...</p>
                </div>
              ) : resumePreviewInfo?.error ? (
                <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    PDF Resume Unavailable
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {resumePreviewInfo.errorMessage}
                  </p>
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => loadResumePreview(currentCandidateId)}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col border border-gray-300 rounded-lg overflow-hidden">
                  <object 
                    data={`${resumePreviewInfo?.url}#toolbar=0&navpanes=0&statusbar=0&view=fitH`}
                    type="application/pdf"
                    className="w-full h-full min-h-[500px] border-0"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50">
                      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                      <p className="text-gray-600 mb-4">PDF preview not available</p>
                      <a 
                        href={resumePreviewInfo?.url}
                        download={resumePreviewInfo?.name}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Download PDF
                      </a>
                    </div>
                  </object>
                  <div className="p-3 bg-gray-50 border-t flex justify-center">
                    <a 
                      href={resumePreviewInfo?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      download={resumePreviewInfo?.name}
                    >
                      <Download className="mr-1" size={16} />
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

        {activeTab === "QA" && (
          <div className="bg-white p-3 border-t shadow-md sticky bottom-0 z-10">
            {showTabs && (
              <QuestionComponent 
                submissionId={currentCandidateId} 
                onAddQuestion={onAddQuestion} 
              />
            )}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/4 bg-white p-4 md:p-1 shadow-lg rounded-xl mt-2 md:mt-0 md:ml-1 flex flex-col border border-gray-200 h-[calc(100vh-20px)]">
        <div className="bg-white text-black p-2 rounded-t-sm flex flex-col justify-between items-center border-b shadow-md sticky top-0">
          <div className="w-full flex justify-between items-center">
            <span className="font-bold text-xl">Analysis Details</span>
          </div>

          {/* {isFetchingAnalysis && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full" 
                style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
              ></div>
            </div>
          )} */}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCandidateAnalysis ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Matching Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.matching_areas?.map((area, index) => (
                    <li key={index} className="p-2 bg-green-100 rounded-lg">
                      <strong>{area.skill || "Unknown skill"}</strong>: {area.years_of_experience || "N/A"}
                    </li>
                  )) || <li className="p-2 text-gray-500">No matching areas data</li>}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Missing Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.missing_areas?.map((area, index) => (
                    <li key={index} className="p-2 bg-red-100 rounded-lg">
                      {area || "Unknown missing skill"}
                    </li>
                  )) || <li className="p-2 text-gray-500">No missing areas data</li>}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Additional Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.additional_areas?.map((area, index) => (
                    <li key={index} className="p-2 bg-blue-100 rounded-lg">
                      {area || "Unknown additional skill"}
                    </li>
                  )) || <li className="p-2 text-gray-500">No additional areas data</li>}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a candidate to view analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;