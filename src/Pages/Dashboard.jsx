import React, { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import { analyzeResumesBulk } from '/src/config/axios.config.js';
import { fetchCandidateAnalysis } from '/src/config/axios.config.js';
import { useNavigate } from "react-router-dom";
import { removeUserData } from "../Helper/LocalStorageHelper.js";
import { INSTRUCTIONS } from "../config/constants.jsx";
import QuestionComponent from '../component/QuestionComponent.jsx';
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Import axios for making HTTP requests

const Dashboard = () => {
  const navigate = useNavigate();

  const [showMatching, setShowMatching] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const [matchingText, setMatchingText] = useState("");
  const [matchingTextRightPanel, setMatchingTextRightPanel] = useState("");
  const [detailedComparison, setDetailedComparison] = useState([]);
  const [missingText, setMissingText] = useState("");
  const [additionalText, setAdditionalText] = useState("");

  // State for questions
  const [beginnerQuestions, setBeginnerQuestions] = useState([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState([]);
  const [expertQuestions, setExpertQuestions] = useState([]);
  const [allEntries, setAllEntries] = useState([]); // Store both prompts and questions

  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submissionId, setSubmissionId] = useState(null);
  const [matchingScore, setMatchingScore] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [errors, setErrors] = useState({});

  const [allResumeResults, setAllResumeResults] = useState([]);
  const [selectedCandidateAnalysis, setSelectedCandidateAnalysis] = useState(null); // State to store the selected candidate's analysis
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
  const [disabledCandidates, setDisabledCandidates] = useState(new Set());
  const [processedCandidates, setProcessedCandidates] = useState(new Set());


  const [activeTab, setActiveTab] = useState("QA");
  // Add currentCandidateId state
  const [currentCandidateId, setCurrentCandidateId] = useState(null);

  //auto scroll
  const candidatesListRef = useRef(null);
  const middlePanelRef = useRef(null);
  const questionInputRef = useRef(null);
  
  // Auto-scroll to bottom when questions are added
  useEffect(() => {
    if (middlePanelRef.current && (beginnerQuestions.length > 0 || intermediateQuestions.length > 0 || expertQuestions.length > 0 || allEntries.length > 0)) {
      middlePanelRef.current.scrollTop = middlePanelRef.current.scrollHeight;
    }
  }, [beginnerQuestions, intermediateQuestions, expertQuestions, allEntries]);



  // Auto-scroll to top of candidates list when analysis completes
  useEffect(() => {
    if (allResumeResults.length > 0 && candidatesListRef.current) {
      candidatesListRef.current.scrollTop = 0;
    }
  }, [allResumeResults]);

  // Auto-scroll to selected candidate
  const scrollToCandidate = (element) => {
    if (candidatesListRef.current && element) {
      const container = candidatesListRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
    }
  };


  const validateForm = () => {
    if (!jobDescription.trim()) {
      alert("Job description is required.");
      return false;
    }
    if (!resume) {
      alert("Resume is required.");
      return false;
    }
    return true; // Return true if no errors
  };

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

  const hasQuestions = () => {
    return (
      beginnerQuestions.length > 0 ||
      intermediateQuestions.length > 0 ||
      expertQuestions.length > 0
    );
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]; // PDF and DOCX MIME types

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert("Only PDF and DOCX files are allowed."); // Alert for invalid file(s)
      setErrors((prev) => ({ ...prev, resume: "Only PDF and DOCX files are allowed." }));
      setResume(null);
    } else {
      setErrors((prev) => ({ ...prev, resume: "" })); // Clear error message
      setResume(files); // Save array of valid files
      alert("File(s) uploaded successfully!"); // Confirmation alert for valid files
    }
  };

  const handleLogout = () => {
    removeUserData();
    navigate("/");
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResponseMessage("");
    setShowMatching(false)
     // Reset candidate analysis state
     setSelectedCandidateAnalysis(null); // Clear selected candidate analysis
     setMatchingScore(0); // Reset matching score
     setMatchingText(""); // Clear matching text
     setMatchingTextRightPanel(""); // Clear matching text in the right panel
     setDetailedComparison([]); // Clear detailed comparison data
     // Reset screening questions
     setBeginnerQuestions([]); // Clear beginner questions
     setIntermediateQuestions([]); // Clear intermediate questions
     setExpertQuestions([]); // Clear expert questions
     setAllEntries([]); // This clears all prompt questions
     setCurrentCandidateId(null); // Reset current candidate ID
     setProcessedCandidates(new Set()); // Clear processed candidates
      

    if (validateForm()) {
      console.log("Form submitted:", { jobDescription, resume, notes });
    }

    try {
      const result = await analyzeResumesBulk(jobDescription, resume, notes);
      console.log("Full Response Data:", result);

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
            promptQuestions: [], // Initialize with empty array
          };
        });

        console.log("Parsed Analyses:", parsedResults);

        if (parsedResults.length > 0) {
          const first = parsedResults[0];

          setSubmissionId(first.submissionId);
          setMatchingScore(first.matching_score);
          setMatchingText(`Candidate: ${first.name}`);
          setMatchingTextRightPanel(`Matching Score: ${first.matching_score}`);
          setDetailedComparison([
            {
              requirement: "Name",
              candidate_experience: first.name,
              evidence: "From resume metadata"
            }
          ]);
          

          setShowInstructions(false);
          setShowScore(true);
          setResponseMessage("Analysis completed successfully!");
        } else {
          setResponseMessage("No analysis data found.");
        }

        // Store all resume results for listing and sort
        const sortedResults = parsedResults.sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0));
        setAllResumeResults(sortedResults);
        // Auto-scroll to bottom after state update
        setTimeout(() => {
          if (candidatesListRef.current) {
            candidatesListRef.current.scrollTo({
              top: candidatesListRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100); 
      } else {
        console.error("Invalid API response format:", result);
        setResponseMessage("Analysis failed. Invalid response.");
      }
    } catch (error) {
      console.error("Request error:", error);
      setResponseMessage("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateClick = async (candidate) => {
    setDisabledCandidates((prev) => new Set(prev).add(candidate.submissionId));
    setIsFetchingAnalysis(true);
    setCurrentCandidateId(candidate.submissionId);
    try {
      const result = await fetchCandidateAnalysis(candidate.submissionId);
    
      if (result.success) {
        setShowMatching(true)
        setSelectedCandidateAnalysis(result.data.ai_analysis);
        setMatchingScore(candidate.matching_score);
        setMatchingText(`Candidate: ${candidate.name}`);
        setMatchingTextRightPanel(`Matching Score: ${candidate.matching_score}`);
        
        // Extract and update detailed comparison data
        const { detailed_comparison } = result.data.ai_analysis;
        const formattedComparison = detailed_comparison.map((item) => ({
          requirement: item.requirement,
          candidate_experience: item.candidate_experience,
          evidence: "From resume analysis",
        }));
        setDetailedComparison(formattedComparison);
  
        // Set screening questions from the API response
        const { screening_questions } = result.data.ai_analysis;
        setBeginnerQuestions(screening_questions.beginner || []);
        setIntermediateQuestions(screening_questions.intermediate || []);
        setExpertQuestions(screening_questions.expert || []);
        
        // Important: Load the candidate's existing prompt questions
        const candidatePrompts = candidate.promptQuestions || [];
        setAllEntries(candidatePrompts);

        //auto scroll
        if (questionInputRef.current) {
          questionInputRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        
      } else {
        toast.error(result.message);
        if (result.message === "Unauthorized! Please log in again.") {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching candidate analysis:", error);
      toast.error("Failed to fetch candidate analysis. Please try again.");
    } finally {
      setIsFetchingAnalysis(false);
      setDisabledCandidates((prev) => {
        const updated = new Set(prev);
        updated.delete(candidate.submissionId);
        return updated;
      });
    }
  };

  const onAddQuestion = (question, level, answer) => {
    const newEntry = { question, answer, level };
  
    // Add to the allEntries state for immediate display
    setAllEntries((prev) => [...prev, newEntry]);
  
    // Store the question with the current candidate
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

  setTimeout(() => {
    if (questionInputRef.current) {
      questionInputRef.current.focus();
    }
  }, 100);


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 md:p-1">
      {/* Left Panel (1 part) */}
 <div className="w-full md:w-1/4 bg-white md:p-2 shadow-lg rounded-xl flex flex-col border border-gray-200 h-[calc(100vh-20px)] overflow-y-auto" ref={candidatesListRef}>
        <div className="border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex justify-between items-center py-3 bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
          <h2 className="text-lg font-bold text-gray-700">Job Description</h2>
        </div>

          <textarea
            className="w-full h-40 border rounded-lg mb-2 flex flex-col min-h-[80px]"
            placeholder="Type or paste the job description here...."
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setErrors((prev) => ({ ...prev, jobDescription: "" }));
            }}
          />
          {errors.jobDescription && <p className="text-red-500 text-sm">{errors.jobDescription}</p>}

          <h2 className="text-lg font-bold mb-2 text-gray-700">Attach Resume (PDF or DOCX only)</h2>
          <input
            type="file"
            id="resumeUpload"
            className="w-full bg-blue-500 text-white rounded-lg cursor-pointer mb-2"
            accept=".pdf, .docx"
            multiple
            onChange={handleUpload}
          />

          {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}

          <h2 className="text-lg font-bold mb-1 text-gray-700">Additional Notes (Optional)</h2>
          <textarea
            className="w-full p-1 h-40 border rounded-lg mb-4 flex flex-col min-h-[80px] "
            placeholder="Type or paste additional notes here...."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
          />

          {loading && (
            <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden  relative">
              <div className="h-full rounded-full animate-[loading_1.5s_linear_infinite] bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
              <style>
                {`
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 80%; }
              100% { width: 100%; }
            }
          `}
              </style>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="relative group inline-block">
              <button
                className="bg-red-600 w-[120px] h-[36px] text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 flex items-center justify-center"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>

              <div className="absolute left-auto sm:left-full top-1/2 sm:top-1/2 mt-1 sm:mt-0 -translate-y-1/2 sm:translate-x-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 shadow-md w-[300px] sm:w-[500px] h-auto max-w-[500px] break-words text-left">
                Generate questions across beginner, intermediate, and expert levels to help assess all candidate skills.
              </div>
            </div>
          </div>
        </div>

        {allResumeResults.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">All Resume Results with CV score:</h2>
            {allResumeResults.length > 0 ? (
              <ul className="space-y-2">
                {allResumeResults.map((result, index) => {
                  // Determine if candidate was previously processed
                  const isProcessed = processedCandidates.has(result.submissionId);
                  const isProcessing = disabledCandidates.has(result.submissionId);
                  const isCurrent = currentCandidateId === result.submissionId;
                  
                  return (
                    <li
                      key={index}
                      className={`p-3 border rounded-lg shadow-sm ${
                        isProcessing
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                      } flex justify-between`}
                      onClick={() => {
                        if (!isProcessing) {
                          // Add to processed candidates when clicked
                          setProcessedCandidates(prev => new Set(prev).add(result.submissionId));
                          handleCandidateClick(result);
                        }
                      }}
                    >
                      <div className="space-y-2 w-full">
                        <div className="flex items-start gap-2">
                          {/* Score circle and text */}
                          <div className="flex gap-2 flex-grow">
                            <span className="bg-blue-600 text-white text-sm font-semibold h-8 w-8 flex items-center justify-center rounded-full shadow-md flex-shrink-0">
                              {result.matching_score}
                            </span>
                            <div className="flex flex-col">
                              <strong>{result.name}</strong>
                              <span className="text-sm text-gray-600">({result.fileName})</span>
                            </div>
                          </div>

                          {/* Dynamic status indicator */}
                          <span className={`h-3 w-3 rounded-full mt-2 flex-shrink-0 ${
                            isProcessing
                              ? 'bg-red-500 animate-pulse'  // Processing
                              : isProcessed || isCurrent
                                ? 'bg-green-500'           // Processed (either previously or current)
                                : 'bg-red-500'             // Not processed
                          }`}
                          title={
                            isProcessing
                              ? 'Processing...'
                              : isProcessed || isCurrent
                                ? 'Analysis complete'
                                : 'Click to analyze'
                          }
                          ></span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500">No resume results available.</p>
            )}
          </div>
        )}
      </div>

      {/* Middle Panel (3 parts) */}
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
        {showMatching && (
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-gray-800">{matchingText} : </h2>
            {/* <span className="w-[120px] h-[36px] flex items-center justify-center bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md">
              {matchingScore}/10
            </span> */}
          </div>
        )}

          {showMatching && (
            <button
              className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                activeTab === "QA"
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-blue-500 text-white hover:bg-blue-300"
              }`}
              onClick={() => setActiveTab("QA")}
            >
              Q&A
            </button>)}
          {showMatching && (
            <button
              className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                activeTab === "Matching Details"
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-blue-500 text-white hover:bg-blue-300"
              }`}
              onClick={() => setActiveTab("Matching Details")}
            >
              JD vs CV Summary Details
            </button>)}
        </div>

        <div className="flex-1 overflow-y-auto p-2 ">
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

{/* {allEntries.map((item, index) => (
      <div key={`prompt-${index}`} className="rounded-lg bg-gray-100 p-2 mb-1 shadow-sm">
        <div className="text-black font-semibold text-lg">
          Prompt: {item.question}
        </div>
        {item.answer && (
          <div className="text-black font-medium text-lg mt-1">
            Answer: {item.answer}
          </div>
        )}
      </div>
    ))} */}
   {allEntries.map((item, index) => (
  <div
    key={`entry-${index}`}
    className={`rounded-lg p-2 mb-1 shadow-sm ${
      item.level === "Beginner"
        ? "bg-green-50" // Light green for Beginner
        : item.level === "Intermediate"
        ? "bg-blue-50" // Light blue for Intermediate
        : item.level === "Expert"
        ? "bg-amber-50" // Light amber for Expert
        : item.level === "Prompt"
        ? "bg-gray-100" // Light gray for Prompt
        : ""
    }`}
  >
    {/* Render BQ, IQ, EQ, or Prompt based on the level */}
    <div
      className={`italic font-medium text-lg ${
        item.level === "Beginner"
          ? "text-green-950 rounded-md"
          : item.level === "Intermediate"
          ? "text-blue-950 rounded-md"
          : item.level === "Expert"
          ? "text-[#8B4513] rounded-md"
          : item.level === "Prompt"
          ? "text-black mb-3 mt-3 rounded-md"
          : ""
      }`}
    >
      {item.level === "Beginner"
        ? "BQ"
        : item.level === "Intermediate"
        ? "IQ"
        : item.level === "Expert"
        ? "EQ"
        : item.level === "Prompt"
        ? "Prompt"
        : ""}
      : {item.question}
    </div>

    {/* Render answer for BQ, IQ, and EQ */}
    {item.level !== "Prompt" && (
      <div
        className={`font-medium text-lg ${
          item.level === "Beginner"
            ? "text-green-950 rounded-md mb-1"
            : item.level === "Intermediate"
            ? "text-blue-950 rounded-md mb-1"
            : item.level === "Expert"
            ? "text-[#8B4513] rounded-md mb-1"
            : ""
        }`}
      >
        Answer: {item.answer}
      </div>
    )}

    {/* Render answer for Prompt (if it exists) */}
    {item.level === "Prompt" && item.answer && (
      <div className="text-black font-medium text-lg mt-1">
        Answer: {item.answer}
      </div>
    )}
  </div>
))}
             {/* This empty div will be used for auto-scrolling to bottom */}
             <div ref={questionInputRef} />
              {showInstructions && INSTRUCTIONS.getContent()}

            </>
          ) : (
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
          )}
          {/* Anchor for scrolling */}
          <div ref={questionInputRef} />
        </div>

        {activeTab === "QA" && (
         <div className="bg-white p-3 border-t shadow-md sticky bottom-0 z-10">
         {submissionId && (
           (candidate) => candidate.submissionId === submissionId 
         ) && (
           <QuestionComponent submissionId={submissionId} onAddQuestion={onAddQuestion} />
         )}
       </div>
        )}
      </div>

      {/* Right Panel (1 part) */}
      <div className="w-full md:w-1/4 bg-white p-4 md:p-1 shadow-lg rounded-xl mt-2 md:mt-0 md:ml-1 flex flex-col border border-gray-200 h-[calc(100vh-20px)]">
      <div className="bg-white text-black p-2 rounded-t-sm flex flex-col justify-between items-center border-b shadow-md sticky top-0">
          {/* Header Text */}
          <div className="w-full flex justify-between items-center">
            <span className="font-bold text-xl">Analysis Details</span>
          </div>

          {/* Progress Bar */}
          {isFetchingAnalysis && (
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden relative mt-1">
              <div className="h-full rounded-full animate-[loading_1.5s_linear_infinite] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <style>
                {`
                  @keyframes loading {
                    0% { width: 0%; }
                    50% { width: 80%; }
                    100% { width: 100%; }
                  }
                `}
              </style>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCandidateAnalysis ? (
            <>
              {/* Display Matching Areas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Matching Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.matching_areas.map((area, index) => (
                    <li key={index} className="p-2 bg-green-100 rounded-lg">
                      <strong>{area.skill}</strong>: {area.years_of_experience}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Display Missing Areas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Missing Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.missing_areas.map((area, index) => (
                    <li key={index} className="p-2 bg-red-100 rounded-lg">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Display Additional Areas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Additional Areas:</h3>
                <ul className="space-y-2">
                  {selectedCandidateAnalysis.additional_areas.map((area, index) => (
                    <li key={index} className="p-2 bg-blue-100 rounded-lg">
                      {area}
                    </li>
                  ))}
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