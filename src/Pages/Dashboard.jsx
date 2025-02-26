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
  const [missingText, setMissingText] = useState("");
  const [additionalText, setAdditionalText] = useState("");

  // State for questions
  const [beginnerQuestions, setBeginnerQuestions] = useState([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState([]);
  const [expertQuestions, setExpertQuestions] = useState([]);

  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [submissionId, setSubmissionId] = useState(null);

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

        setMatchingText(analysis.matching_areas?.join(", ") || "No matching areas found");
        setMissingText(analysis.missing_areas?.join(", ") || "No missing areas found");
        setAdditionalText(analysis.additional_areas?.join(", ") || "No additional areas found");

        // Set question data safely
        setBeginnerQuestions(analysis.screening_questions?.beginner || []);
        setIntermediateQuestions(analysis.screening_questions?.intermediate || []);
        setExpertQuestions(analysis.screening_questions?.expert || []);

        // Set submission ID from the response
        setSubmissionId(result.data.submission_id);

        setShowInstructions(false);
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
    const newQuestion = { question, answer };

    switch (level) {
      case "Beginner":
        setBeginnerQuestions((prev) => [...prev, newQuestion]);
        break;
      case "Intermediate":
        setIntermediateQuestions((prev) => [...prev, newQuestion]);
        break;
      case "Expert":
        setExpertQuestions((prev) => [...prev, newQuestion]);
        break;
      default:
        break;
    }
  };

  return (
  <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 md:p-2">
  {/* Left Panel (Fixed Height with Scrollable Content) */}
  <div
    className="w-full md:w-1/3 bg-white md:p-6 shadow-lg rounded-xl flex flex-col border border-gray-200 h-[calc(100vh-20px)] overflow-y-auto"
  >
    <div className="flex justify-between items-center mt-4 mb-4">
      <h2 className="text-lg font-bold text-gray-700">Job Description</h2>
    </div>

    <textarea
      className="w-full p-1 h-20 border rounded-lg mb-2 focus:ring focus:ring-blue-300"
      placeholder="Type or paste the job description here...."
      value={jobDescription}
      onChange={(e) => setJobDescription(e.target.value)}
    />

    <h2 className="text-lg font-bold mb-2 text-gray-700">Attach Resume</h2>
    <input
      type="file"
      className="w-full bg-blue-400 text-white pl-1 py-1 rounded-lg cursor-pointer mb-2"
      onChange={handleUpload}
    />

    <h2 className="text-lg font-bold mb-2 text-gray-700">Additional Notes</h2>
    <textarea
      className="w-full p-1 h-20 border rounded-lg mb-4 focus:ring focus:ring-blue-300"
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
      <div className="mt-1 p-1 bg-gray-200 rounded-lg mb-4 text-center">
        {responseMessage}
      </div>
    )}

    <button
      className="bg-red-500 w-[100px] text-white mt-2 px-3 py-1 mb-2 rounded-md text-sm shadow-sm hover:bg-red-600"
      onClick={handleAnalyze}
      disabled={loading}
    >
      {loading ? "Analyzing..." : "Analyze"}
    </button>

    {/* Scrollable Questions Section */}
    {hasQuestions() &&
      [
        { label: "Matching Areas", state: showMatching, setter: setShowMatching, value: matchingText },
        { label: "Missing Areas", state: showMissing, setter: setShowMissing, value: missingText },
        { label: "Additional Areas", state: showAdditional, setter: setShowAdditional, value: additionalText },
      ].map(({ label, state, setter, value }) => (
        <div className="mb-4" key={label}>
          <button
            className="w-full bg-blue-600 text-white mt-4 rounded-lg focus:outline-none shadow-md flex justify-between items-center px-4"
            onClick={() => setter(!state)}
          >
            {label}
            {state ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
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
<div
  className="w-full md:w-2/3 bg-white p-4 md:p-6 shadow-lg rounded-xl mt-4 md:mt-0 md:ml-2 flex flex-col border border-gray-200 h-[calc(100vh-20px)]"
  style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "cover" }}
>

  {/* Fixed Header */}
  <div className="bg-white text-black p-3 rounded-t-xl flex justify-between items-center border-b shadow-md sticky top-0 z-10">
    <span className="font-bold text-xl">Recruiter Copilot Chat</span>
    <button
      className="text-red-500 flex items-center hover:text-red-700 transition duration-200"
      onClick={handleLogout}
    >
      <LogOut className="mr-2" size={24} /> Logout
    </button>
  </div>

  {/* Scrollable Content Area */}
  <div className="flex-1 overflow-y-auto p-4">
    {/* Display Beginner Questions */}
    {beginnerQuestions.map((item, index) => (
      <div key={`beginner-${index}`} className="mb-4">
        <div className="text-black font-bold italic font-medium">BQ : {item.question}</div>
        <div className="text-black font-medium">Answer: {item.answer}</div>
      </div>
    ))}

    {/* Display Intermediate Questions */}
    {intermediateQuestions.map((item, index) => (
      <div key={`intermediate-${index}`} className="mb-4">
        <div className="text-black font-bold italic font-medium">IQ : {item.question}</div>
        <div className="text-black font-medium">Answer: {item.answer}</div>
      </div>
    ))}

    {/* Display Expert Questions */}
    {expertQuestions.map((item, index) => (
      <div key={`expert-${index}`} className="mb-4">
        <div className="text-black font-bold italic font-medium">EQ : {item.question}</div>
        <div className="text-black font-medium">Answer: {item.answer}</div>
      </div>
    ))}

    {showInstructions && INSTRUCTIONS.getContent()}
  </div>

  {/* Fixed Footer (Prompt Section) */}
  <div className="bg-white p-3 border-t shadow-md sticky bottom-0 z-10">
    {submissionId && (
      <QuestionComponent submissionId={submissionId} onAddQuestion={onAddQuestion} />
    )}
  </div>

</div>

    </div>
  );
};

export default Dashboard;