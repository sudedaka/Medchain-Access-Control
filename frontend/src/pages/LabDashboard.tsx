import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Microscope,
  Upload,
  Database,
  Loader2,
  CheckCircle,
} from "lucide-react";

import { uploadLabResult } from "../../services/api";

const LabDashboard: React.FC = () => {
  const navigate = useNavigate();
  const labId = localStorage.getItem("userId");

  const [patientIdInput, setPatientIdInput] = useState("");
  const [testTypeInput, setTestTypeInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ---- Upload Handler ----
  const handleUpload = async () => {
    if (!patientIdInput || !testTypeInput || !selectedFile) {
      alert("Patient ID, Test Type and File are required.");
      return;
    }

    setUploading(true);
    try {
      await uploadLabResult(patientIdInput, testTypeInput, selectedFile);
      setUploadSuccess(true);

      // Reset fields
      setPatientIdInput("");
      setTestTypeInput("");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-400 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* HEADER */}
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-purple-500/20 rounded-2xl mr-6 border border-purple-500/30">
            <Microscope className="w-10 h-10 text-purple-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Laboratory Portal</h1>
            <p className="text-slate-400">
              Logged in as:{" "}
              <span className="text-blue-300 font-semibold">{labId}</span>
            </p>
            <p className="text-slate-400">
              Securely upload and transmit medical test results.
            </p>
          </div>
        </header>

        {/* MAIN CARD */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden mb-8 shadow-2xl">
          <div className="p-6 bg-purple-900/20 border-b border-purple-500/20 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-purple-200 flex items-center">
              <Database className="w-5 h-5 mr-3" />
              Laboratory Data Entry
            </h2>
          </div>

          <div className="p-10">
            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* Patient ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="e.g. patient1"
                />
              </div>

              {/* Test Type (manual input) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Type
                </label>
                <input
                  type="text"
                  value={testTypeInput}
                  onChange={(e) => setTestTypeInput(e.target.value)}
                  className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="e.g. Blood Test, MRI Scan, Pathology Report"
                />
              </div>
            </div>

            {/* FILE UPLOAD BOX */}
            <label className="border-2 border-dashed border-slate-600 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 hover:border-purple-500/50 transition-all cursor-pointer group">
              
              <input
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />

              <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>

              {!selectedFile ? (
                <>
                  <span className="text-sm font-medium">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs text-slate-600 mt-2">Supports PNG, JPG, PDF</span>
                </>
              ) : (
                <span className="text-sm text-purple-300 mt-2">
                  Selected: {selectedFile.name}
                </span>
              )}
            </label>

            {/* SUCCESS MESSAGE */}
            {uploadSuccess && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Lab result successfully saved.
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 font-bold shadow-lg shadow-purple-900/40 transition-all hover:-translate-y-1 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LabDashboard;
