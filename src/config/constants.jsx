export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_GUEST = "ROLE_GUEST";

export const INSTRUCTIONS = {
  showInstructions: false,
  getContent: () => (
    <div className="w-full bg-white mt-6 p-6 rounded-2xl border border-gray-300 shadow-md max-w-2xl mx-auto">
      {/* Section: How It Works */}
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <span>🔹</span> How It Works
      </h2>

      <ul className="mt-4 space-y-3 text-gray-700 text-base">
        {[
          "Type the Job Description in the left panel.",
          "Attach your resume.",
          "Add any additional notes (optional).",
          'Click the <span class="text-blue-600 font-semibold">"Analyze"</span> button.'
        ].map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-gray-900 font-medium">Step {index + 1}:</span>
            <span dangerouslySetInnerHTML={{ __html: step }} />
          </li>
        ))}
      </ul>

      <p className="mt-6 text-gray-800 leading-relaxed">
        Once analyzed, the right panel will display <strong>questions and answers</strong> based on the Job Description and Resume.  
        The left panel will highlight <strong>Matching Areas, Missing Areas, and Additional Notes</strong> for better insights.
      </p>

      {/* Section: Question Levels */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🔹</span> Question Levels
        </h2>

        <ul className="mt-4 space-y-3 text-gray-700 text-base">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">BQ (Beginner Level Question):</span>
            <span>Basic questions that test fundamental understanding and recall of concepts.</span>
          </li>

          <li className="flex items-start gap-2">
            <span className="font-semibold text-green-600">IQ (Intermediate Level Question):</span>
            <span>Detailed questions that require analysis and application of knowledge.</span>
          </li>

          <li className="flex items-start gap-2">
            <span className="font-semibold text-red-600">EQ (Expert Level Question):</span>
            <span>Advanced questions that involve critical thinking, problem-solving, and real-world scenarios.</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};
