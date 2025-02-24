import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { analyzeResume } from "../config/axios.config";
import { useNavigate } from "react-router-dom";
import { removeUserData } from "../Helper/LocalStorageHelper";
import { INSTRUCTIONS } from "../config/constants.jsx";

const Dashboard = () => {
  const navigate = useNavigate();

  const [showMatching, setShowMatching] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const [matchingText, setMatchingText] = useState("");
  const [missingText, setMissingText] = useState("");
  const [additionalText, setAdditionalText] = useState("");

  
  // New state variables for questions
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

  // Helper to check if any question categories have items
  const hasQuestions = () => {
    return beginnerQuestions.length > 0 ||
      intermediateQuestions.length > 0 ||
      expertQuestions.length > 0;
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
    if (!jobDescription || !resume) {
      alert("Please provide a job description and attach a resume.");
      return;
    }

    setLoading(true);
    setResponseMessage("");

    try {
      const result = await analyzeResume(jobDescription, resume, notes);

      console.log("Full Response Data:", result);  // Debugging

      if (result.success && result.data && result.data.analysis) {  // Fix: Check result.data.analysis
        const analysis = result.data.analysis;  // Now safely accessing analysis

        setMatchingText(analysis.matching_areas?.join(", ") || "No matching areas found");
        setMissingText(analysis.missing_areas?.join(", ") || "No missing areas found");
        setAdditionalText(analysis.additional_areas?.join(", ") || "No additional areas found");

        // Set question data safely
        setBeginnerQuestions(analysis.screening_questions?.beginner || []);
        setIntermediateQuestions(analysis.screening_questions?.intermediate || []);
        setExpertQuestions(analysis.screening_questions?.expert || []);
        setShowInstructions(false); 
        setResponseMessage("Analysis completed successfully!");
      } else {
        setResponseMessage(`Error: Analysis data is missing.`);
      }
    } catch (error) {
      setResponseMessage("An unexpected error occurred.");
      console.error("Request error:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Left Panel */}
      <div className="w-full md:w-1/3 bg-white p-4 md:p-6 shadow-lg rounded-xl flex flex-col border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Job Description</h2>
          <button
            className="bg-red-500 w-[100px] text-white px-3 py-1 rounded-md text-sm shadow-sm hover:bg-red-600"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        <textarea
          className="w-full p-3 h-40 border rounded-lg mb-4 focus:ring focus:ring-blue-300"
          placeholder="Paste the Job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <h2 className="text-lg font-semibold mb-2 text-gray-700">Attach Resume</h2>
        <input
          type="file"
          className="w-full bg-blue-500 text-white pl-3 py-2 rounded-lg cursor-pointer mb-4"
          onChange={handleUpload}
        />

        <h2 className="text-lg font-semibold mb-2 text-gray-700">Attach Notes</h2>
        <textarea
          className="w-full p-3 border rounded-lg mb-4 focus:ring focus:ring-blue-300"
          placeholder="Type additional notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {loading && (
          <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden mt-2 relative">
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
          <div className="mt-1 p-3 bg-gray-200 rounded-lg mb-4 text-center">
            {responseMessage}
          </div>
        )}

        {/* Only show these areas if questions are available */}
        {hasQuestions() && [
          { label: "Matching Areas", state: showMatching, setter: setShowMatching, value: matchingText },
          { label: "Missing Areas", state: showMissing, setter: setShowMissing, value: missingText },
          { label: "Additional Areas", state: showAdditional, setter: setShowAdditional, value: additionalText },
        ].map(({ label, state, setter, value }) => (
          <div className="mb-4" key={label}>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg focus:outline-none shadow-md"
              onClick={() => setter(!state)}
            >
              {label}
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
        className="w-full md:w-2/3 bg-white p-4 md:p-6 shadow-lg rounded-xl mt-4 md:mt-0 md:ml-6 flex flex-col border border-gray-200"
        style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "cover" }}
      >
        <div className="bg-white text-black p-3 rounded-t-xl flex justify-between items-center border-b">
          <span className="font-bold text-xl">Recruiter Copilot Chat</span>
          <button
            className="text-red-500 flex items-center hover:text-red-700 transition duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" size={24} /> Logout
          </button>
        </div>

        {/* Chat Messages */}
        {/* Display beginner questions */}
        {beginnerQuestions.map((item, index) => (
          <div key={`beginner-${index}`} className="mb-4">
            <div className="text-black font-medium">BQ : {item.question}</div>
            <div className="text-black font-medium">Answer {item.answer}</div>
          </div>
        ))}

        {/* Display intermediate questions */}
        {intermediateQuestions.map((item, index) => (
          <div key={`intermediate-${index}`} className="mb-4">
            <div className="text-black font-medium">IQ : {item.question}</div>
            <div className="text-black font-medium">Answer  {item.answer}</div>
          </div>
        ))}

        {/* Display expert questions */}
        {expertQuestions.map((item, index) => (
          <div key={`expert-${index}`} className="mb-4">
            <div className="text-black font-medium">EQ : {item.question}</div>
            <div className="text-black font-medium">Answer {item.answer}</div>
          </div>
        ))}
        {showInstructions && INSTRUCTIONS.getContent()}

        {/* Input Box - Only show if questions are available */}
        {hasQuestions() && (
          <div className="p-3 bg-white rounded-b-xl flex items-center border-t">
            <input className="flex-1 p-2 border border-gray-800 rounded-lg" placeholder="Type a prompt..." />
            <button className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg">B</button>
            <button className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg">I</button>
            <button className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg">E</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
