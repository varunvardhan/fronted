import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
/*import { fetchJobByJobId, submitCandidateInterview } from "../config/axios.config";*/
import { fetchJobByJobId } from "../config/axios.config";


const InterviewPage = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    resume: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await fetchJobByJobId(jobId);

      if (!result.success) {
        setErrorMsg(result.message || "Failed to load job details");
      } else {
        // Most APIs return: { job: {...} }
        setJob(result.data.job || result.data);
      }

      setLoading(false);
    };
    load();
  }, [jobId]);

  const handleInput = (e) => {
    setCandidate((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResume = (e) => {
    setCandidate((prev) => ({
      ...prev,
      resume: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await submitCandidateInterview(jobId, candidate);

    if (!result.success) {
      setSubmitResult({
        type: "error",
        message: result.message,
      });
    } else {
      setSubmitResult({
        type: "success",
        message: "Interview started successfully!",
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 p-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-6">

        {loading ? (
          <p className="text-center text-slate-500">Loading job details…</p>
        ) : errorMsg ? (
          <p className="text-center text-red-500">{errorMsg}</p>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">
              {job?.title}
            </h1>
            <p className="text-sm text-slate-600 mt-2">{job?.description}</p>

            <hr className="my-6" />

            {submitResult && (
              <div
                className={`p-3 rounded-md text-sm mb-4 ${
                  submitResult.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {submitResult.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700">
                  Full Name
                </label>
                <input
                  name="name"
                  value={candidate.name}
                  onChange={handleInput}
                  required
                  className="w-full border p-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={candidate.email}
                  onChange={handleInput}
                  required
                  className="w-full border p-2 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700">
                  Upload Resume
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResume}
                  required
                  className="w-full border p-2 rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Start Interview"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
