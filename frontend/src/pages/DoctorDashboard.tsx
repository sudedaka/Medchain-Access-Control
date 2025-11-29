import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {  ArrowLeft,  Stethoscope,  FileSearch,  Activity,  FileText,  Clock,  CheckCircle,  AlertCircle,  X,  Loader2,  Search,  Database,
  Lock,  Microscope,  ClipboardList,  TestTube,  ChevronLeft,  ChevronRight} from 'lucide-react';

import {  createRequest,  getAuthorizedData,  getDoctorRequests} from "../../services/api";

//Real timestamp formatting
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  const day = date.getDate().toString().padStart(2, "0");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];

  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} – ${hours}:${minutes}`;
}


// ---------------- Modal Component ----------------
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-800/50">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
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
  const [reqPurpose, setReqPurpose] = useState("");
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
    if (!reqPatientId || !reqPurpose) return;

    setReqStatus("sending");
    try {
      await createRequest(doctorId, reqPatientId, reqPurpose);
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
    setReqPurpose("");
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


  // -------- Render Medical Records Modal ----------
  const renderMedicalData = (data: any) => {
    const medical = data.medical || {};
    const conditions = medical.conditions || [];
    const labs = medical.labs || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <p className="text-xl font-mono text-white">Patient: {viewPatientId}</p>
          <span className="px-3 py-1 text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-medium">
            Access Granted
          </span>
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div>
            <h4 className="text-slate-300 mb-2 font-medium flex items-center">
              <ClipboardList className="w-4 h-4 mr-2 text-blue-400" />
              Diagnoses
            </h4>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c: string, idx: number) => (
                <span key={idx}
                  className="px-3 py-1 text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Labs */}
        {labs.length > 0 && (
          <div>
            <h4 className="text-slate-300 mb-2 font-medium flex items-center">
              <Microscope className="w-4 h-4 mr-2 text-purple-400" />
              Lab Results
            </h4>

            <div className="space-y-2">
              {labs.map((lab: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <TestTube className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-white">{lab.test}</p>
                      <p className="text-xs text-slate-500">{lab.date}</p>
                    </div>
                  </div>

                  <span className="text-white font-mono">{lab.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 mb-8 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </button>


        {/* HEADER */}
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl mr-6 shadow">
            <Stethoscope className="w-10 h-10 text-blue-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">Doctor Portal</h1>
            <p className="text-slate-400 mt-1">
              Logged in as:{" "}
              <span className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-300 font-semibold">
                {doctorId}
              </span>
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Manage data requests and access medical records securely.
            </p>
          </div>
        </header>


        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* Create Request */}
          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700 hover:border-blue-500/40 transition shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                <FileSearch className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl text-white font-semibold">Request Access</h2>
            </div>

            <p className="text-slate-400 mb-8 text-sm">
              Initiate a request to access a patient's medical history.
            </p>

            <button
              onClick={() => setActiveModal('request')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            >
              <Lock className="w-4 h-4 mr-2 inline-block" /> New Data Request
            </button>
          </div>


          {/* View Records */}
          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700 hover:border-teal-500/40 transition shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-teal-500/20 rounded-xl mr-4">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-xl text-white font-semibold">Authorized Records</h2>
            </div>

            <p className="text-slate-400 mb-8 text-sm">
              View medical data for patients who granted access.
            </p>

            <button
              onClick={() => setActiveModal('view')}
              className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
            >
              <Database className="w-4 h-4 mr-2 inline-block" /> Access Clinical Records
            </button>
          </div>
        </div>


        {/* RECENT ACTIVITY (DYNAMIC NOW) */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-500" />
            Recent Activity
          </h3>
        </div>

        <div className="bg-slate-800/30 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-grow">
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex font-semibold text-xs text-slate-500 uppercase">
              <span className="w-1/3">Patient</span>
              <span className="w-1/3">Purpose</span>
              <span className="w-1/3 text-right">Status</span>
            </div>

            {doctorRequests.length === 0 && (
              <div className="p-4 text-slate-500 text-sm text-center">
                No recent activity.
              </div>
            )}

            {currentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 flex justify-between items-center border-b border-slate-800/50 hover:bg-slate-800/40 transition"
              >
                {/* Patient */}
                <div className="w-1/3">
                  <span className="text-sm text-white font-mono">
                    {req.patientId}
                  </span>
              <p className="text-xs text-slate-500">
              {formatTimestamp(req.createdAt)}
            </p>

                </div>

                {/* Purpose */}
                <div className="w-1/3 text-slate-300">{req.purpose}</div>

                {/* Status */}
                <div className="w-1/3 flex justify-end">
                  {req.status === "approved" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs 
                      bg-green-500/10 text-green-400 border border-green-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" /> Granted
                    </span>
                  )}

                  {req.status === "pending" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs 
                      bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}

                  {req.status === "rejected" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs 
                      bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle className="w-3 h-3 mr-1" /> Denied
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
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs text-slate-400 font-medium">
                Page <span className="text-white">{currentPage}</span> of {totalPages}
              </span>
              
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300"
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
        >
          {reqStatus === "sent" ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">REQUEST SENT</h3>
              <button
                className="w-full py-3 mt-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                onClick={resetRequest}
              >
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-6">
              
              {/* Patient ID */}
              <div>
                <label className="text-sm text-slate-400">Patient ID</label>
                <div className="relative mt-1">
                  <input
                    value={reqPatientId}
                    onChange={(e) => setReqPatientId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white"
                    placeholder="patient1"
                    required
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-sm text-slate-400">Purpose</label>
                <textarea
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white mt-1"
                  placeholder="Reason for access request..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={reqStatus === "sending"}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
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
        >
          {!viewData ? (
            <form onSubmit={handleViewAuthorized} className="space-y-6">
              <p className="text-slate-400">Enter Patient ID:</p>

              <input
                type="text"
                value={viewPatientId}
                onChange={(e) => setViewPatientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white"
                placeholder="patient1"
              />

              {viewError && (
                <div className="text-red-400 text-sm">{viewError}</div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 rounded-lg text-white"
              >
                {viewLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : "Access Records"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {renderMedicalData(viewData)}

              <button
                onClick={closeViewModal}
                className="w-full py-3 mt-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default DoctorDashboard;