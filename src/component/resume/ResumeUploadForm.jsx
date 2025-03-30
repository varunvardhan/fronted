import React from 'react';

const ResumeUploadForm = ({ 
  jobDescription, 
  setJobDescription, 
  notes, 
  setNotes, 
  resume, 
  setResume, 
  errors, 
  setErrors 
}) => {
  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert("Only PDF and DOCX files are allowed.");
      setErrors((prev) => ({ ...prev, resume: "Only PDF and DOCX files are allowed." }));
      setResume(null);
    } else {
      setErrors((prev) => ({ ...prev, resume: "" }));
      setResume(files);
      alert("File(s) uploaded successfully!");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter the job description..."
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes..."
          />
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Upload Resume(s)
          </label>
          <input
            type="file"
            id="resume"
            multiple
            accept=".pdf,.docx"
            onChange={handleUpload}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {errors.resume && (
            <p className="mt-1 text-sm text-red-600">{errors.resume}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadForm; 