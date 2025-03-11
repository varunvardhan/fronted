import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { analyzeResume } from "../config/axios.config.js";
import { useNavigate } from "react-router-dom";
import { removeUserData } from "../Helper/LocalStorageHelper.js";
import { INSTRUCTIONS } from "../config/constants.jsx";
import QuestionComponent from '../component/QuestionComponent.jsx';
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [matchingScore, setMatchingScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
 
  

  const [activeTab, setActiveTab] = useState("QA");
  

  // Helper to check if any question categories have items
  const hasQuestions = () => {
    return (
      beginnerQuestions.length > 0 ||
      intermediateQuestions.length > 0 ||
      expertQuestions.length > 0
    );
  };

  // Function to toggle section visibility
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleUpload = (event) => {
    setResume(event.target.files[0]);
  };

  const handleLogout = () => {
    removeUserData();
    navigate("/");
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResponseMessage("");

    try {
      // Call analyzeResume with the correct parameters
      const result = await analyzeResume(jobDescription, resume, notes);

      console.log("Full Response Data:", result); // Debugging

      if (result.success && result.data && result.data.analysis) {
        const analysis = result.data.analysis;

        setMatchingText(
          analysis.matching_areas?.map(area => `${area.skill}`).join(", ") || 
          "No matching areas found"
        );

        setMatchingTextRightPanel(
          analysis.matching_areas
            ?.map(area => `${area.skill} (${area.years_of_experience || "N/A"})`)
            .join("\n") || "No matching areas found"
        );

       

        setDetailedComparison(
          Array.isArray(analysis.detailed_comparison) 
            ? analysis.detailed_comparison.map(area => ({
                requirement: area.requirement,
                candidate_experience: area.candidate_experience || "N/A"
              })) 
            : []
        );
        
        
        
        
        setMissingText(analysis.missing_areas?.join(", ") || "No missing areas found");
        setAdditionalText(analysis.additional_areas?.join(", ") || "No additional areas found");

        // Set question data safely
        setBeginnerQuestions(analysis.screening_questions?.beginner || []);
        setIntermediateQuestions(analysis.screening_questions?.intermediate || []);
        setExpertQuestions(analysis.screening_questions?.expert || []);
       

        // Set submission ID from the response
        setSubmissionId(result.data.submission_id);
        setMatchingScore(result.data.analysis.matching_score);

        setShowInstructions(false);
        setShowScore(true); // Show score after successful analysis
        setResponseMessage("Analysis completed successfully!");
      } else {
        setResponseMessage(`Error: Analysis data is missing.`);
      }
    } catch (error) {
      setResponseMessage("Failed to analyze. Please try again.");
      console.error("Request error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a question to the appropriate category
  const onAddQuestion = (question, level, answer) => {
    const newEntry = { question, answer, level };

    setAllEntries((prev) => {
        let updatedEntries = [...prev];

        // Find the last prompt index
        let lastPromptIndex = updatedEntries.map((e) => e.level).lastIndexOf("Prompt");

        if (level === "Prompt") {
            // Add new prompt at the end
            updatedEntries.push(newEntry);
        } else {
            // Insert new questions after the last prompt
            if (lastPromptIndex !== -1) {
                updatedEntries.splice(lastPromptIndex + 1, 0, newEntry);
            } else {
                updatedEntries.push(newEntry); // If no prompt, append normally
            }
        }
        return updatedEntries;
    });
};


  return (
  <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 md:p-1">
  {/* Left Panel (Fixed Height with Scrollable Content) */}
  <div
    className="w-full md:w-1/3 bg-white md:p-2 shadow-lg rounded-xl flex flex-col border border-gray-200 h-[calc(100vh-20px)] overflow-y-auto"
  >
    <div className="border border-gray-200 rounded-lg p-2 shadow-md">

    <div className="flex justify-between items-center mt-4 mb-2">
      <h2 className="text-lg font-bold text-gray-700">Job Description</h2>
    </div>

    <textarea
      className="w-full h-40 border rounded-lg mb-2 flex flex-col min-h-[80px]"
      placeholder="Type or paste the job description here...."
      value={jobDescription}
      onChange={(e) => setJobDescription(e.target.value)}
    />

    <h2 className="text-lg font-bold mb-2 text-gray-700">Attach Resume (PDF or DOCX only)</h2>
    <input
      type="file"
      className="w-full bg-blue-500 text-white rounded-lg cursor-pointer mb-2"
      onChange={handleUpload}
    />

    <h2 className="text-lg font-bold mb-1 text-gray-700">Additional Notes (Optional)</h2>
    <textarea
      className="w-full p-1 h-40 border rounded-lg mb-4 flex flex-col min-h-[80px] "
      placeholder="Type or paste additional notes here...."
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
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

    {responseMessage && (
      <div className=" p-1 bg-gray-200 rounded-lg mb-1 text-center">
        {responseMessage}
      </div>
    )}

<div className="flex justify-between items-center mt-4">
    {/* Analyze Button with Tooltip */}
    <div className="relative group inline-block">
      <button
        className="bg-red-600 w-[120px] h-[36px] text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 flex items-center justify-center"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {/* Tooltip with Overflow Protection */}
      <div className="absolute left-auto sm:left-full top-1/2 sm:top-1/2 mt-1 sm:mt-0 -translate-y-1/2 sm:translate-x-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 shadow-md w-[300px] sm:w-[500px] h-auto max-w-[500px] break-words text-left">
        Generate questions across beginner, intermediate, and expert levels to help assess all candidate skills.
      </div>
    </div>

    {/* Candidate CV Score (Hidden Initially) */}
    {showScore && (
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-gray-800">CV Score:</h2>
        <span className="w-[120px] h-[36px] flex items-center justify-center bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md">
          {matchingScore}/10
        </span>
      </div>
    )}
  </div>




  </div>

    {/* Scrollable Questions Section */}
    {hasQuestions() &&
  [
    { label: "Matching Areas", state: showMatching, setter: setShowMatching, value: matchingText },
    { label: "Missing Areas", state: showMissing, setter: setShowMissing, value: missingText },
    { label: "Additional Areas", state: showAdditional, setter: setShowAdditional, value: additionalText },
  ].map(({ label, state, setter, value }) => (
    <div className="mb-4" key={label}>
      <div className="relative group w-full">
        <button
          className="w-full bg-blue-600 text-white mt-4 rounded-lg focus:outline-none shadow-md flex justify-between items-center px-4 relative"
          onClick={() => setter(!state)}
        >
          {label}
          {state ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Tooltip */}
        <div className="absolute left-1/2 -top-10 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200">
          Click to toggle {label.toLowerCase()}
        </div>
      </div>

      {state && (
        <textarea
          className="w-full p-3 border rounded-lg mt-2 focus:ring focus:ring-blue-300"
          placeholder={label}
          value={value}
          readOnly
        />
      )}
    </div>
  ))}

  </div>


     {/* Right Panel */}
<div className="w-full md:w-2/3 bg-white p-4 md:p-1 shadow-lg rounded-xl mt-2 md:mt-0 md:ml-1 flex flex-col border border-gray-200 h-[calc(100vh-20px)]"
  style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "cover" }}
>

  {/* Fixed Header */}
  <div className="bg-white text-black p-2 rounded-t-sm flex justify-between items-center border-b shadow-md sticky top-0">
    <span className="font-bold text-xl">BMI CoPanelist Chat</span>
    <button
      className="text-red-500 flex items-center hover:text-red-700 transition duration-200"
      onClick={handleLogout}
    >
      <LogOut className="mr-2" size={24} /> Logout
    </button>
  </div>

  {/* Tab Navigation */}
  <div className="flex space-x-1 border-b bg-gray-100 rounded-t-lg shadow-md px-1">
  <button
    className={`px-4 py-2 text-sm rounded-t-md transition-all duration-200 ${
      activeTab === "QA"
        ? "bg-white font-bold border-t-2 border-x-2 border-blue-500 shadow-sm"
        : "text-gray-600 bg-gray-200 hover:bg-gray-300"
    }`}
    onClick={() => setActiveTab("QA")}
  >
    Q&A
  </button>

  <button
    className={`px-4 py-2 text-sm rounded-t-md transition-all duration-200 ${
      activeTab === "Matching Details"
        ? "bg-white font-bold border-t-2 border-x-2 border-blue-500 shadow-sm"
        : "text-gray-600 bg-gray-200 hover:bg-gray-300"
    }`}
    onClick={() => setActiveTab("Matching Details")}
  >
    JD vs. Candidate Fit Summary
  </button>
</div>


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 ">
        {activeTab === "QA" ? (
          <>
            {beginnerQuestions.map((item, index) => (
              <div key={`beginner-${index}`} className="mb-2 p-4 rounded-lg shadow-md">
              <div className="text-green-950 font-semibold italic text-lg leading-relaxed p-2 rounded-lg">
  BQ: {item.question}
</div>
<div className="text-green-950 font-semibold text-lg leading-relaxed p-2 rounded-lg mb-1">
  Answer: {item.answer}
</div>

              </div>
            ))}

            {intermediateQuestions.map((item, index) => (
              <div key={`intermediate-${index}`} className="mb-2 p-4 rounded-lg shadow-md">
               <div className="text-blue-900 italic font-medium text-lg leading-relaxed p-3 rounded-lg">
  IQ: {item.question}
</div>
<div className="text-blue-900 font-medium text-lg leading-relaxed p-2 rounded-lg mb-1">
  Answer: {item.answer}
</div>

              </div>
            ))}

            {expertQuestions.map((item, index) => (
              <div key={`expert-${index}`} className="mb-2 p-4 rounded-lg shadow-md">
               <div className="text-[#5A3E1B] italic font-medium text-lg leading-relaxed p-3 rounded-lg">
  EQ: {item.question}
</div>
<div className="text-[#5A3E1B] font-medium text-lg leading-relaxed p-2 rounded-lg mb-2">
  Answer: {item.answer}
</div>


              </div>
            ))}

{allEntries.map((item, index) => (
  <div key={`entry-${index}`} className="mb-2 p-4 rounded-lg shadow-md">
    <div
      className={`italic font-medium text-lg ${
        item.level === "Beginner" ? "text-green-900 p-3 rounded-md" :
        item.level === "Intermediate" ? "text-blue-800 p-3 rounded-md" :
        item.level === "Expert" ? "text-[#8B4513] p-3 rounded-md" :
        item.level === "Prompt" ? "text-black p-3 rounded-md" : ""
      }`}
    >
      {item.level === "Beginner" ? "BQ" :
       item.level === "Intermediate" ? "IQ" :
       item.level === "Expert" ? "EQ" :
       item.level === "Prompt" ? "Prompt" : ""} 
      : {item.question}
    </div>

    {item.level !== "Prompt" && (
      <div
        className={`font-medium text-lg ${
          item.level === "Beginner" ? "text-green-900  p-3 rounded-md" :
          item.level === "Intermediate" ? "text-blue-800  p-3 rounded-md" :
          item.level === "Expert" ? "text-[#8B4513] p-3 rounded-md" : ""
        }`}
      >
        Answer: {item.answer}
      </div>
    )}
  </div>
))}

                          
            {showInstructions && INSTRUCTIONS.getContent()}
          </>

        ) : (
          
          <div>
           
            
           {hasQuestions() && (
  <div className="mb-6 space-y-6">
    {/* Candidate CV Score and Matching Areas */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-900 flex items-center mb-4">
        JD Required Skills vs Candidate's Relevant Experience
      </h3>


     {/* Comparison Section */}
     <div className="bg-gray-100 p-4 mt-5 rounded-2xl text-black text-lg leading-relaxed whitespace-pre-line shadow-inner">
  {detailedComparison.length > 0 ? (
    detailedComparison.map((item, index) => (
      <div key={index} className="mb-2">
        <strong>{item.requirement}</strong> - {item.candidate_experience}
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
      </div>
  {/* Fixed Footer (Prompt Section) */}
  {activeTab === "QA" && (
  <div className="bg-white p-3 border-t shadow-md sticky bottom-0 z-10">
    {submissionId && (
      <QuestionComponent submissionId={submissionId} onAddQuestion={onAddQuestion} />
    )}
  </div>
)}

</div>

    </div>
  );
};

export default Dashboard;