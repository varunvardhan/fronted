import React from 'react';
import QuestionComponent from '../QuestionComponent';

const AnalysisResults = ({
  selectedCandidateAnalysis,
  matchingText,
  matchingTextRightPanel,
  detailedComparison,
  beginnerQuestions,
  intermediateQuestions,
  expertQuestions,
  allEntries,
  onAddQuestion,
  middlePanelRef
}) => {
  return (
    <div 
      ref={middlePanelRef}
      className="bg-white shadow rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto"
    >
      <div className="space-y-6">
        {selectedCandidateAnalysis && (
          <>
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-2">{matchingText}</h2>
              <p className="text-lg text-gray-700">{matchingTextRightPanel}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Comparison</h3>
              <div className="space-y-2">
                {detailedComparison.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{item.requirement}</p>
                    <p className="text-gray-600">{item.candidate_experience}</p>
                    <p className="text-sm text-gray-500">{item.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Interview Questions</h3>
              <div className="space-y-4">
                {beginnerQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600">Beginner Questions</h4>
                    <div className="space-y-2">
                      {beginnerQuestions.map((q, index) => (
                        <QuestionComponent
                          key={index}
                          question={q}
                          level="beginner"
                          onAddQuestion={onAddQuestion}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {intermediateQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600">Intermediate Questions</h4>
                    <div className="space-y-2">
                      {intermediateQuestions.map((q, index) => (
                        <QuestionComponent
                          key={index}
                          question={q}
                          level="intermediate"
                          onAddQuestion={onAddQuestion}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {expertQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600">Expert Questions</h4>
                    <div className="space-y-2">
                      {expertQuestions.map((q, index) => (
                        <QuestionComponent
                          key={index}
                          question={q}
                          level="expert"
                          onAddQuestion={onAddQuestion}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults; 