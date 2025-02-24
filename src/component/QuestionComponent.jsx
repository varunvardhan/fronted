import React, { useState } from "react";
import { askAI } from "../service/auth.ai.service"; // Import your service function

const QuestionComponent = ({ submissionId, onAddQuestion }) => {
  const [question, setQuestion] = useState("");

  // Function to check if the question is a meta-question
  const isMetaQuestion = (question) => {
    return question.toLowerCase().includes("give me") || question.toLowerCase().includes("list");
  };

  // Function to normalize the API response and extract only the questions
  const normalizeResponse = (response) => {
    // Remove the prefix (e.g., "BQ :") and any introductory message
    const cleanedResponse = response
      .replace(/^(BQ|IQ|EQ)\s*:\s*/, "") // Remove "BQ :", "IQ :", or "EQ :"
      .replace(/Here are \d+ beginner questions for the candidate:\s*/, ""); // Remove introductory message

    // Split the response by numbers (e.g., "1.", "2.", etc.) and filter out empty lines
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

    // Determine the level text
    const levelText = {
      B: "Beginner",
      I: "Intermediate",
      E: "Expert",
    }[level];

    try {
      const result = await askAI(question, submissionId);

      if (isMetaQuestion(question)) {
        // If it's a meta-question, normalize the response and extract only the questions
        const questions = normalizeResponse(result.data.answer);

        // Add each question to the appropriate category
        questions.forEach((q) => {
          onAddQuestion(q.trim(), levelText, ""); // No answer is displayed
        });
      } else {
        // If it's a regular question, add it as a single question-answer pair
        onAddQuestion(question, levelText, result.data.answer);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch questions. Please try again.");
    }

    // Clear the input field after adding the question
    setQuestion("");
  };

  return (
    <div className="p-3 bg-white rounded-b-xl flex items-center border-t">
      {/* Input field for typing a custom question */}
      <input
        className="flex-1 p-2 border border-gray-800 rounded-lg"
        placeholder="Type a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Level buttons (B, I, E) */}
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg"
        onClick={() => handleLevelClick("B")}
      >
        B
      </button>
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg"
        onClick={() => handleLevelClick("I")}
      >
        I
      </button>
      <button
        className="ml-2 bg-red-200 border border-gray-600 text-black p-2 rounded-lg"
        onClick={() => handleLevelClick("E")}
      >
        E
      </button>
    </div>
  );
};

export default QuestionComponent;