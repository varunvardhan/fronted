import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createInterviewLink } from "../config/axios.config";
import { FiCopy, FiCheck } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";


import {
  AiFillHome,
  AiOutlineFileAdd,
  AiOutlineUnorderedList,
} from "react-icons/ai";

const JobManagement = () => {
  const navigate = useNavigate();
  const [view, setView] = useState(""); // Initially set to "", this will trigger the welcome message
  const [jobSnippets, setJobSnippets] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    minScore: 70,
  });
  const [apiResponseData, setApiResponseData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Ensure the "view" state is set to "" when the page loads
  useEffect(() => {
    setView(""); // Reset view to empty when the page loads
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async (text, field) => {
    try {
      if (!navigator.clipboard) {
        console.error("Clipboard API not available");
        return;
      }

      await navigator.clipboard.writeText(text);
      setCopiedField(field);

      // reset after 2s
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Optional: fallback UI
      // alert("Copy failed, please copy manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Build payload as expected by your backend
    const payload = {
      title: formData.title,
      description: formData.description,
      job_description_text: formData.description, // or a separate field if you add one later
      minimum_score_threshold: Number(formData.minScore),
      is_active: true,
    };

    // 2️⃣ Call the API via axios.config helper
    const result = await createInterviewLink(payload);

    if (!result.success) {
      console.error("Failed:", result);
    } else {
      console.log("Success:", result.data);

      // ⭐ STORE API RESPONSE DATA HERE
      setApiResponseData({
        share_link: result.data?.share_link,
        embed_iframe: result.data?.embed_iframe,
        embed_script: result.data?.embed_script,
      });
    }

    // 3️⃣ KEEP YOUR EXISTING UI BEHAVIOR EXACTLY THE SAME ✅
    setJobSnippets((prev) => [...prev, formData]);
    setFormData({ title: "", description: "", minScore: 70 });
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* LEFT PANEL - ICON ONLY SIDEBAR */}
      <div className="w-20 md:w-24 lg:w-28 bg-slate-900 border-r border-slate-800 shadow-xl flex flex-col items-center py-6">
        {/* Brand / Logo */}
        <div className="mb-10 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-800 shadow-inner">
          <span className="text-sm font-semibold text-slate-100">JM</span>
        </div>

       <nav className="flex flex-col items-center justify-between h-full w-full py-4">
  <div className="flex flex-col items-center space-y-6">
    {/* Home */}
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
      className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 transition"
    >
      <AiFillHome size={22} className="text-slate-200" />
      <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition shadow-lg">
        Home
      </span>
    </button>

    {/* Create */}
    <button
      type="button"
      onClick={() => setView("create")}
      className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-red-600 hover:border-red-500 transition"
    >
      <AiOutlineFileAdd size={22} className="text-red-400 group-hover:text-white" />
      <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition shadow-lg">
        Create Job Snippet
      </span>
    </button>

    {/* History */}
    <button
      type="button"
      onClick={() => setView("history")}
      className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 transition"
    >
      <AiOutlineUnorderedList size={22} className="text-blue-400 group-hover:text-white" />
      <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition shadow-lg">
        View Job Snippet
      </span>
    </button>
  </div>

  {/* ============ LOGOUT BUTTON (BOTTOM POSITION) ============ */}
  <button
    type="button"
    onClick={() => console.log("Logout Clicked")} // <-- replace with your logout logic
    className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-red-500 transition"
  >
    <FiLogOut size={22} className="text-red-400 group-hover:text-red-200" />

    <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition shadow-lg">
      Log Out
    </span>
  </button>
</nav>

      </div>

      {/* RIGHT PANEL - PROFESSIONAL LAYOUT */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top heading / description when no view selected */}
          {view === "" && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 shadow-lg text-slate-50">
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                Interview Management
              </h1>
              <p className="text-sm md:text-base text-slate-200">
                Create standardized interview snippets with a minimum score threshold
                and quickly review previously created snippets in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-600">
                  ✨ Streamlined screening
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-600">
                  📄 Reusable interview snippets
                </span>
              </div>
            </div>
          )}

          {/* CREATE FORM - NEW DESIGN */}
          {view === "create" && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Create Interview Snippet
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    Define a role, its description, and the minimum score
                    required to qualify.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Draft mode</span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title & Min Score in a grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium text-slate-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 px-3 py-2.5 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                        placeholder="e.g. Senior Frontend Engineer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-slate-700">
                        Minimum Score (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="minScore"
                          value={formData.minScore}
                          onChange={handleInputChange}
                          className="w-full border border-slate-200 px-3 py-2.5 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                          min={0}
                          max={100}
                          required
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          threshold
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Candidates below this score will be filtered out.
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Job Description
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Include key responsibilities & required skills
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 px-3 py-2.5 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 min-h-[120px]"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-400">
                      You can edit or reuse this snippet later from{" "}
                      <span className="font-semibold text-slate-600">
                        Interivew Snippet History
                      </span>
                      .
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-600 active:scale-[0.99] transition"
                    >
                      <span>Create Interview link Snippet</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EMBEDDED LINK & CODE - PROFESSIONAL UI */}
          {apiResponseData && (
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                    Interview Link & Integration
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    Share or embed this interview in your careers page, ATS, or email.
                  </p>
                </div>
                <span className="hidden md:inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">
                  Live embed ready
                </span>
              </div>

              {/* SHARE LINK */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Share Link
                </label>
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition cursor-default">
                  <code className="text-xs md:text-sm text-slate-800 break-all font-mono">
                    {apiResponseData.share_link}
                  </code>

                  <div
                    onClick={() =>
                      handleCopy(apiResponseData.share_link, "share_link")
                    }
                    className="relative group flex items-center justify-center ml-3 p-1.5 rounded-md cursor-pointer hover:bg-slate-200 active:scale-95 transition"
                  >
                    {copiedField === "share_link" ? (
                      <FiCheck size={18} className="text-emerald-600" />
                    ) : (
                      <FiCopy size={18} className="text-slate-700" />
                    )}
                    <span
                      className={`absolute -bottom-6 text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white whitespace-nowrap transform transition ${
                        copiedField === "share_link"
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      {copiedField === "share_link" ? "Copied!" : "Copy"}
                    </span>
                  </div>
                </div>
              </div>

              {/* EMBED IFRAME */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Embed Iframe
                </label>
                <div className="relative group">
                  <pre className="w-full p-4 bg-slate-950 text-slate-100 text-[11px] md:text-xs rounded-xl border border-slate-800 shadow-inner overflow-x-auto font-mono">
                    <code>{apiResponseData.embed_iframe}</code>
                  </pre>

                  <div
                    onClick={() =>
                      handleCopy(apiResponseData.embed_iframe, "embed_iframe")
                    }
                    className="absolute right-3 top-3 flex items-center justify-center p-1.5 rounded-md bg-slate-900/80 cursor-pointer hover:bg-slate-800 active:scale-95 transition"
                  >
                    {copiedField === "embed_iframe" ? (
                      <FiCheck size={18} className="text-emerald-400" />
                    ) : (
                      <FiCopy size={18} className="text-slate-100" />
                    )}
                    <span
                      className={`absolute -bottom-6 text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white whitespace-nowrap transform transition ${
                        copiedField === "embed_iframe"
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      {copiedField === "embed_iframe" ? "Copied!" : "Copy"}
                    </span>
                  </div>
                </div>
              </div>

              {/* EMBED SCRIPT */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Embed Script
                </label>
                <div className="relative group">
                  <pre className="w-full p-4 bg-slate-950 text-slate-100 text-[11px] md:text-xs rounded-xl border border-slate-800 shadow-inner overflow-x-auto font-mono">
                    <code>{apiResponseData.embed_script}</code>
                  </pre>

                  <div
                    onClick={() =>
                      handleCopy(apiResponseData.embed_script, "embed_script")
                    }
                    className="absolute right-3 top-3 flex items-center justify-center p-1.5 rounded-md bg-slate-900/80 cursor-pointer hover:bg-slate-800 active:scale-95 transition"
                  >
                    {copiedField === "embed_script" ? (
                      <FiCheck size={18} className="text-emerald-400" />
                    ) : (
                      <FiCopy size={18} className="text-slate-100" />
                    )}
                    <span
                      className={`absolute -bottom-6 text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white whitespace-nowrap transform transition ${
                        copiedField === "embed_script"
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      {copiedField === "embed_script" ? "Copied!" : "Copy"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY - MODERN LIST DESIGN */}
          {view === "history" && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Job Snippet History
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    Review previously created job snippets and their score
                    thresholds.
                  </p>
                </div>
                <div className="hidden md:flex gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 bg-slate-100 rounded-full">
                    Total: {jobSnippets.length}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {jobSnippets.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-sm text-slate-500">
                      No job snippets created yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Create your first snippet from the{" "}
                      <span className="font-semibold text-slate-600">
                        Create Job Snippet
                      </span>{" "}
                      icon on the left.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {jobSnippets.map((job, index) => (
                      <li
                        key={index}
                        className="border border-slate-100 rounded-xl p-4 shadow-sm bg-slate-50 hover:bg-white hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                              {job.title}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-600 mt-1">
                              {job.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                              Min Score: {job.minScore}%
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Snippet #{index + 1}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
