import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Microscope } from 'lucide-react';
import RoleCard from './components/RoleCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  const handleContinue = () => {
    if (!userId.trim()) return alert("Please enter your ID");

    // store in browser
    localStorage.setItem("role", selectedRole!);
    localStorage.setItem("userId", userId);

    // redirect
    if (selectedRole === "Doctor") navigate("/doctor");
    if (selectedRole === "Patient") navigate("/patient");
    if (selectedRole === "Lab") navigate("/lab");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 overflow-hidden bg-[#0f172a]">

      {/* Mesh Gradient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/40 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/40 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/40 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-lg">
          Medchain <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            Control Access
          </span>
        </h1>
        <p className="text-lg text-slate-300 font-light max-w-xl mx-auto">
          Next-generation decentralized medical data governance. Secure, transparent, and patient-centric.
        </p>
      </div>

      {/* Role Selection */}
      {!selectedRole && (
        <main className="relative z-10 flex flex-col md:flex-row gap-6 w-full max-w-6xl justify-center items-stretch">
          <RoleCard
            title="Doctor"
            icon={Stethoscope}
            gradient="from-blue-500 to-cyan-500"
            description="Request patient data, view authorized medical records, and manage clinical insights securely."
            onClick={() => setSelectedRole("Doctor")}
          />
          <RoleCard
            title="Patient"
            icon={User}
            gradient="from-emerald-500 to-teal-500"
            description="Full sovereignty over your data. Grant or revoke access consents via the blockchain ledger."
            onClick={() => setSelectedRole("Patient")}
          />
          <RoleCard
            title="Lab"
            icon={Microscope}
            gradient="from-purple-500 to-pink-500"
            description="Submit immutable test results and genomic sequencing data directly to the secure network."
            onClick={() => setSelectedRole("Lab")}
          />
        </main>
      )}

      {/* ID Input Screen */}
      {selectedRole && (
        <div className="relative z-20 mt-10 w-full max-w-md bg-slate-800/70 p-6 rounded-xl shadow-lg backdrop-blur-lg border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Enter {selectedRole} ID
          </h2>

          <input
            type="text"
            placeholder={`${selectedRole} ID`}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 rounded bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none"
          />

          <button
            onClick={handleContinue}
            className="mt-4 w-full p-3 rounded bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
          >
            Continue to {selectedRole} Portal
          </button>

          <button
            className="mt-4 w-full text-sm text-slate-400 underline"
            onClick={() => {
              setSelectedRole(null);
              setUserId("");
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
