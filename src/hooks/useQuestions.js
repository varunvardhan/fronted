import { useState, useEffect, useRef } from 'react';

export const useQuestions = () => {
  const [beginnerQuestions, setBeginnerQuestions] = useState([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState([]);
  const [expertQuestions, setExpertQuestions] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("QA");
  const [showInstructions, setShowInstructions] = useState(true);
  const middlePanelRef = useRef(null);

  // Auto-scroll to bottom when questions are added
  useEffect(() => {
    if (middlePanelRef.current && (beginnerQuestions.length > 0 || intermediateQuestions.length > 0 || expertQuestions.length > 0 || allEntries.length > 0)) {
      middlePanelRef.current.scrollTop = middlePanelRef.current.scrollHeight;
    }
  }, [beginnerQuestions, intermediateQuestions, expertQuestions, allEntries]);

  const hasQuestions = () => {
    return (
      beginnerQuestions.length > 0 ||
      intermediateQuestions.length > 0 ||
      expertQuestions.length > 0
    );
  };

  const onAddQuestion = (question, level, answer) => {
    const newEntry = { question, level, answer };
    setAllEntries((prev) => [...prev, newEntry]);
  };

  const setQuestionsFromAnalysis = (analysis) => {
    if (analysis) {
      setBeginnerQuestions(analysis.beginner_questions || []);
      setIntermediateQuestions(analysis.intermediate_questions || []);
      setExpertQuestions(analysis.expert_questions || []);
    }
  };

  return {
    beginnerQuestions,
    intermediateQuestions,
    expertQuestions,
    allEntries,
    activeTab,
    setActiveTab,
    showInstructions,
    setShowInstructions,
    middlePanelRef,
    hasQuestions,
    onAddQuestion,
    setQuestionsFromAnalysis
  };
}; 