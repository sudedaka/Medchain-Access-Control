import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,  Stethoscope,  FileSearch,  Activity,  FileText,  Clock,  CheckCircle,  AlertCircle,  X,  Loader2,
  Search,  Database,  Lock,  Microscope,  ClipboardList,  TestTube,  ChevronLeft,  ChevronRight,  ExternalLink, User, Ruler, Weight
} from 'lucide-react';

import {
  createRequest,
  getAuthorizedData,
  getDoctorRequests
} from "../../services/api";


// ---------------- Helpers ----------------

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} – ${hours}:${minutes}`;
}

// ---------------- Components ----------------

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string; // Added prop to control width
}> = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Dynamic maxWidth applied here */}
      <div className={`relative w-full ${maxWidth} bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-800/50 shrink-0">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
      </div>
    </div>
  );
};

// --- Lab Result Item with Carousel ---
const LabResultItem: React.FC<{ lab: any }> = ({ lab }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = lab.images || [];
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all mb-3 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <TestTube className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-slate-100 font-semibold text-sm">{lab.test}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mt-0.5">
              {lab.date}
            </p>
          </div>
        </div>
        
        {/* Hide 'see-image' text, only show real text results */}
        {lab.result && !lab.result.startsWith("see") && (
           <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
             {lab.result}
           </span>
        )}
      </div>

      {/* Image Carousel */}
      {hasImages && (
        <div className="relative group/image rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mt-3">
           <div className="aspect-video w-full relative flex items-center justify-center bg-black/40">
             <img 
               src={images[currentImgIndex]} 
               alt="Lab Result" 
               className="h-full w-full object-contain cursor-pointer transition-opacity duration-300"
               onClick={() => window.open(images[currentImgIndex], "_blank")}
             />
             
             {/* External Link Hint */}
             <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/60 text-white p-1.5 rounded-lg backdrop-blur-sm">
                  <ExternalLink className="w-3 h-3" />
                </span>
             </div>
           </div>
           
           {/* Navigation Controls */}
           {hasMultiple && (
             <>
               <button 
                 onClick={(e) => { e.stopPropagation(); prevImage(); }}
                 className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm border border-white/10"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); nextImage(); }}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm border border-white/10"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
               
               {/* Pagination Dots/Counter */}
               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-[10px] text-white font-medium backdrop-blur-md border border-white/10">
                 {currentImgIndex + 1} / {images.length}
               </div>
             </>
           )}
        </div>
      )}
    </div>
  );
};


// ---------------- MAIN DOCTOR DASHBOARD ----------------
const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("userId") ?? "";

  // --- State ---
  const [activeModal, setActiveModal] = useState<'none' | 'request' | 'view'>('none');

  // Request form
  const [reqPatientId, setReqPatientId] = useState("");

  const [reqStatus, setReqStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // View Authorized Data
  const [viewPatientId, setViewPatientId] = useState("");
  const [viewData, setViewData] = useState<any>(null);
  const [viewError, setViewError] = useState("");
  const [viewLoading, setViewLoading] = useState(false);

  // Recent Doctor Requests & Pagination
  const [doctorRequests, setDoctorRequests] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  // ---- Load doctor's real request activity ----
  useEffect(() => {
    async function load() {
      const result = await getDoctorRequests(doctorId);
      setDoctorRequests(result.requests.reverse());
    }
    load();
  }, [doctorId]);

  
  // -------- Handle Request Creation ----------
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPatientId) return;

setReqStatus("sending");
try {
  await createRequest(doctorId, reqPatientId);
  await new Promise(res => setTimeout(res, 600));
  setReqStatus("sent");

  // Refresh table
  const result = await getDoctorRequests(doctorId);
  setDoctorRequests(result.requests.reverse());
  setCurrentPage(1); // Reset to first page on new entry

} catch (err) {
  console.error(err);
  alert("Failed to send request.");
  setReqStatus("idle");
}
}; 

  const resetRequest = () => {
    setReqPatientId("");
   
    setReqStatus("idle");
    setActiveModal("none");
  };


  // ---------- Handle View Authorized Data -----------
  const handleViewAuthorized = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewPatientId) return;

    setViewLoading(true);
    setViewError("");
    setViewData(null);

    try {
      const data = await getAuthorizedData(viewPatientId, doctorId);
      setViewData(data);
    } catch (err) {
      console.error(err);
      setViewError("Access denied or no records found.");
    } finally {
      setViewLoading(false);
    }
  };


  const closeViewModal = () => {
    setViewPatientId("");
    setViewData(null);
    setViewError("");
    setActiveModal("none");
  };


  // -------- Render Medical Records Section (NEW WIDE LAYOUT) ----------
const renderMedicalData = (data: any) => {
  const identity = data.identity || {};
  const medical = data.medical || {};
  const conditions = medical.conditions || [];
  const labs = medical.labs || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">

      {/* --- LEFT COLUMN: PATIENT IDENTITY & VITALS (Span 4) --- */}
      <div className="md:col-span-4 space-y-4">
        
        {/* Identity Card */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/80 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center px-2.5 py-1 text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <Lock className="w-3 h-3 mr-1.5 opacity-70" />
              Decrypted
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div className="mb-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Patient ID</span>
            <p className="text-2xl font-mono text-white tracking-tight font-bold mt-0.5">{viewPatientId}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-slate-700/50 pt-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Age</span>
              <p className="text-sm text-slate-200 font-medium mt-0.5">
                {identity.age || "-"}
              </p>
            </div>
            <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Sex</span>
                <p className="text-sm text-slate-200 font-medium mt-0.5">
                  {identity.sex || "-"}
                </p>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
             <Ruler className="w-5 h-5 text-blue-400 mb-1" />
             <span className="text-xs text-slate-500 font-medium">Height</span>
             <span className="text-lg font-bold text-white">{identity.height || "-"}<span className="text-xs text-slate-500 ml-0.5 font-normal">cm</span></span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
             <Weight className="w-5 h-5 text-emerald-400 mb-1" />
             <span className="text-xs text-slate-500 font-medium">Weight</span>
             <span className="text-lg font-bold text-white">{identity.weight || "-"}<span className="text-xs text-slate-500 ml-0.5 font-normal">kg</span></span>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60">
          <h4 className="text-slate-400 mb-4 text-xs font-bold uppercase tracking-wider flex items-center">
            <ClipboardList className="w-4 h-4 mr-2 text-blue-400" />
            Active Conditions
          </h4>

          {conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {conditions.map((c: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-blue-200 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
             <div className="text-slate-500 text-xs italic py-2">No active conditions recorded.</div>
          )}
        </div>

        {/* Allergies - Added Component */}
        {medical.allergies && medical.allergies.length > 0 && (
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60">
            <h4 className="text-slate-400 mb-4 text-xs font-bold uppercase tracking-wider flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
              Allergies
            </h4>
            <div className="flex flex-wrap gap-2">
              {medical.allergies.map((a: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-semibold"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>


      {/* --- RIGHT COLUMN: LAB RESULTS (Span 8) --- */}
      <div className="md:col-span-8 bg-slate-800/20 rounded-2xl border border-slate-700/40 flex flex-col overflow-hidden">
        
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center shrink-0">
          <h4 className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center">
            <Microscope className="w-4 h-4 mr-2 text-purple-400" />
            Laboratory Reports
          </h4>
          <span className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
            Total: {labs.length}
          </span>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar h-full min-h-[300px]">
          {labs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {labs.map((lab: any, i: number) => (
                <LabResultItem key={i} lab={lab} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
              <TestTube className="w-12 h-12 mb-3" />
              <p>No lab results found for this encounter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};



  // ---------------- Pagination Logic ----------------
  const totalPages = Math.ceil(doctorRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = doctorRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  // --------------------------------------------------------
  // ------------------------ RENDER -------------------------
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden font-sans">

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 mb-8 hover:text-white transition group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>


        {/* HEADER */}
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl mr-6 shadow-lg shadow-blue-900/20">
            <Stethoscope className="w-10 h-10 text-blue-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Doctor Portal</h1>
            <div className="flex items-center text-slate-400 space-x-2">
               <span>Logged in as:</span>
               <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/10 rounded text-blue-300 font-semibold text-sm">
                {doctorId}
              </span>
            </div>
          </div>
        </header>


        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* Create Request */}
          <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all duration-300 shadow-xl group">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                <FileSearch className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl text-white font-semibold">Request Access</h2>
            </div>

            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Initiate a securely logged request to access a patient's medical history or genetic data.
            </p>

            <button
              onClick={() => setActiveModal('request')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/30 transition-all font-medium flex items-center justify-center group-hover:translate-y-[-2px]"
            >
              <Lock className="w-4 h-4 mr-2" /> New Data Request
            </button>
          </div>


          {/* View Records */}
          <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-teal-500/40 hover:bg-slate-800/60 transition-all duration-300 shadow-xl group">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-teal-500/20 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-xl text-white font-semibold">Authorized Records</h2>
            </div>

            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              View decrypted medical data for patients who have explicitly granted access via the blockchain.
            </p>

            <button
              onClick={() => setActiveModal('view')}
              className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 transition-all font-medium flex items-center justify-center group-hover:translate-y-[-2px]"
            >
              <Database className="w-4 h-4 mr-2" /> Access Clinical Records
            </button>
          </div>
        </div>


        {/* RECENT ACTIVITY */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-500" />
            Recent Activity
          </h3>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-grow">
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex font-semibold text-xs text-slate-500 uppercase tracking-wider">
              <span className="w-1/3">Patient</span>
           
              <span className="w-1/3 text-right">Status</span>
            </div>

            {doctorRequests.length === 0 && (
              <div className="p-8 text-slate-500 text-sm text-center flex flex-col items-center justify-center h-full">
                <Clock className="w-8 h-8 mb-2 opacity-20" />
                No recent activity found.
              </div>
            )}

            {currentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 flex justify-between items-center border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group"
              >
                {/* Patient */}
                <div className="w-1/3">
                  <span className="text-sm text-white font-mono font-medium group-hover:text-blue-300 transition-colors">
                    {req.patientId}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{formatTimestamp(req.createdAt)}</p>
                </div>

                {/* Status */}
                <div className="w-1/3 flex justify-end">
                  {req.status === "approved" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <CheckCircle className="w-3 h-3 mr-1.5" /> Granted
                    </span>
                  )}

                  {req.status === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Clock className="w-3 h-3 mr-1.5" /> Pending
                    </span>
                  )}

                  {req.status === "rejected" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle className="w-3 h-3 mr-1.5" /> Denied
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300 border border-transparent hover:border-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs text-slate-400 font-medium">
                Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
              </span>
              
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300 border border-transparent hover:border-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>


        {/* ---------------------------------------------- */}
        {/* ----------- MODALS (BOTTOM SECTION) ---------- */}
        {/* ---------------------------------------------- */}

        {/* Send Request Modal */}
        <Modal
          isOpen={activeModal === 'request'}
          onClose={resetRequest}
          title={reqStatus === "sent" ? undefined : "New Data Request"}
          maxWidth="max-w-lg"
        >
          {reqStatus === "sent" ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center ring-1 ring-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">REQUEST SENT</h3>
              <p className="text-slate-400 text-sm mb-6">The patient has been notified for approval.</p>
              <button
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                onClick={resetRequest}
              >
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-6">
              
              {/* Patient ID */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1.5 block">Patient ID</label>
                <div className="relative">
                  <input
                    value={reqPatientId}
                    onChange={(e) => setReqPatientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. patient1"
                    required
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>


              {/* Buttons */}
              <div className="flex justify-end pt-2">
                 <button
                  type="button"
                  onClick={resetRequest}
                  className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg mr-2 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqStatus === "sending"}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/30 transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
                >
                  {reqStatus === "sending" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : "Send Request"}
                </button>
              </div>
            </form>
          )}
        </Modal>


        {/* Authorized Data Modal (View Records) */}
        <Modal
          isOpen={activeModal === 'view'}
          onClose={closeViewModal}
          title={viewData ? "Authorized Clinical Data" : "Access Clinical Records"}
          maxWidth={viewData ? "max-w-5xl" : "max-w-lg"} // WIDER MODAL WHEN DATA IS PRESENT
        >
          {!viewData ? (
            <form onSubmit={handleViewAuthorized} className="space-y-6">
              <p className="text-slate-400 text-sm">Enter the Patient ID to securely retrieve decrypted records.</p>
              
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1.5 block">Patient ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={viewPatientId}
                    onChange={(e) => setViewPatientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 px-4 text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none"
                    placeholder="e.g. patient1"
                    autoFocus
                  />
                   <Database className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {viewError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center">
                   <AlertCircle className="w-4 h-4 mr-2" />
                   {viewError}
                </div>
              )}

              <div className="flex justify-end pt-4">
                 <button
                  type="button"
                  onClick={closeViewModal}
                  className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg mr-2 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium shadow-lg shadow-teal-900/30 transition-all flex items-center justify-center"
                >
                  {viewLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : "Access Records"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {renderMedicalData(viewData)}

         
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default DoctorDashboard;