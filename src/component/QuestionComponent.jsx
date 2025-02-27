import React, { useState } from "react";
import { askAI } from "../service/auth.ai.service"; // Import your service function

const QuestionComponent = ({ submissionId, onAddQuestion }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  // Function to check if the question is a meta-question
  const isMetaQuestion = (question) => {
    return question.toLowerCase().includes("give me") || question.toLowerCase().includes("list");
  };

  // Function to normalize the API response and extract only the questions
  const normalizeResponse = (response) => {
    const cleanedResponse = response
      .replace(/^(BQ|IQ|EQ)\s*:\s*/, "")
      .replace(/Here are \d+ beginner questions for the candidate:\s*/, "");

    const questions = cleanedResponse.split(/\d+\.\s*/).filter((q) => q.trim() !== "");
    return questions;
  };

  // Function to handle level button clicks (B, I, E)
  const handleLevelClick = async (level) => {
    if (!submissionId) {
      alert("Please analyze first to get a submission ID.");
      return;
    }

    if (!question.trim()) {
      alert("Please type a question before selecting a level.");
      return;
    }

    const levelText = {
      B: "Beginner",
      I: "Intermediate",
      E: "Expert"
    }[level];

    setLoading(true); // Show loading bar

    try {
      const result = await askAI(question, submissionId);
      const responseData = JSON.parse(result.data.answer); // Parse JSON response
      
      onAddQuestion(`${question}`, "Prompt", "");

      if (responseData.questions && Array.isArray(responseData.questions)) {
          responseData.questions.forEach((q) => {
              onAddQuestion(q.question.trim(), levelText, q.expected_answer.trim());
          });
      } else {
          console.error("Invalid response format:", responseData);
          alert("Unexpected response format. Please try again.");
      }
  } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch questions. Please try again.");
  }
  
  setLoading(false); // Hide loading bar
  setQuestion(""); // Clear input
  };

  return (
    <div className="p-3 bg-white rounded-b-xl flex items-center border-t">
      {/* Progress bar (only visible when loading) */}
      
      {loading && (
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-[loadingRGB_2s_linear_infinite] transition-opacity duration-300"></div>
)}


      {/* Input field */}
      <input
        className="flex-1 p-2 border border-gray-800 rounded-lg"
        placeholder="Type a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading} // Disable input when loading
      />

      {/* Level buttons (B, I, E) */}
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-blue-500 p-2 rounded-lg disabled:opacity-50"
        onClick={() => handleLevelClick("B")}
        disabled={loading} // Disable button when loading
      >
        B
      </button>
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-[brown] p-2 rounded-lg disabled:opacity-50"
        onClick={() => handleLevelClick("I")}
        disabled={loading} // Disable button when loading
      >
        I
      </button>
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg disabled:opacity-50"
        onClick={() => handleLevelClick("E")}
        disabled={loading} // Disable button when loading
      >
        E
      </button>
    </div>
  );
};

export default QuestionComponent;
