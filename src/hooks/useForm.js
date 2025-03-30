import { useState } from 'react';

export const useForm = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required.";
    }
    if (!resume) {
      newErrors.resume = "Resume is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, resume: "Only PDF and DOCX files are allowed." }));
      setResume(null);
      return false;
    }

    setErrors(prev => ({ ...prev, resume: "" }));
    setResume(files);
    return true;
  };

  const resetForm = () => {
    setJobDescription("");
    setNotes("");
    setResume(null);
    setErrors({});
  };

  return {
    jobDescription,
    setJobDescription,
    notes,
    setNotes,
    resume,
    setResume,
    errors,
    setErrors,
    validateForm,
    handleFileUpload,
    resetForm
  };
}; 