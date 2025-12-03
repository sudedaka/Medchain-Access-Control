import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,   User,   Bell,   Check,   X,   Shield,   CheckCircle,   AlertTriangle,  Loader2,  ChevronLeft,  ChevronRight} from 'lucide-react';
import React, { useEffect, useState } from "react";
import {  getPendingRequests,  approveRequest,  rejectRequest,  getAudit, getAuthorizedData} from "../../services/api";

// --- Event Translator ---
function translateEvent(event: string) {
  switch(event) {
    case "REQUEST_CREATED":
      return "Access Request Logged";
    case "REQUEST_APPROVED":
      return "Access Granted";
    case "REQUEST_REJECTED":
      return "Access Denied";
    default:
      return event;
  }
}

// --- Reusable Modal Component ---
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
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {(title) && (
          <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-800/50">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
  // --- Timestamp Formatter ---
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

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const patientId = localStorage.getItem("userId") ?? "";

  // State
  const [pending, setPending] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal State
  const [activeModal, setActiveModal] =  useState<'none' | 'confirm' | 'deny' | 'success'>('none');
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);

  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load pending + audit logs + health data
  useEffect(() => {
    async function load() {
      const pendingData = await getPendingRequests(patientId);
      const auditData = await getAudit(patientId);

      setPending(pendingData.pending);
      setAudit((auditData?.audit || []).reverse());


      // Fetch own health data
      try {
        const data = await getAuthorizedData(patientId, patientId);
        setHealthData(data);
      } catch (err) {
        console.log("Health data not available or restricted");
      }
    }
    load();
  }, [patientId]);

  const handleOpenApproveModal = (req: any) => {
    setSelectedReq(req);
    setActiveModal('confirm');
  };

  const handleConfirmApprove = async () => {
    if (!selectedReq) return;
    
    setIsProcessing(true);
    try {
      await approveRequest(selectedReq.id);

      setPending(prev => prev.filter(p => p.id !== selectedReq.id));
      
      const updatedAudit = await getAudit(patientId);
      setAudit(updatedAudit.audit.reverse());

      setActiveModal('success');
    } catch (error) {
      console.error(error);
      alert("Failed to approve request.");
      setActiveModal('none');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setActiveModal('none');
    setSelectedReq(null);
  };

     const handleConfirmDeny = async () => {
    if (!selectedRejectId) return;

    await rejectRequest(selectedRejectId);

    // UI update
    setPending(prev => prev.filter((p) => p.id !== selectedRejectId));

    const updatedAudit = await getAudit(patientId);
    setAudit(updatedAudit.audit.reverse());

    setSelectedRejectId(null);
    setActiveModal('none');
  };


  // Pagination Logic
  const totalPages = Math.ceil(audit.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuditItems = audit.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const identity = healthData?.identity || {};
  const medical = healthData?.medical || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden font-sans">

      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-slate-400 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-teal-500/20 rounded-2xl mr-6 border border-teal-500/30">
            <User className="w-10 h-10 text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Patient Portal</h1>
            <p className="text-slate-400">
              Logged in as: <span className="text-blue-300 font-semibold">{patientId}</span>
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">

            {/* My Health Summary */}
            {healthData && (
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center mb-5">
                  <User className="w-5 h-5 mr-2 text-teal-400" />
                  My Health Summary
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-slate-900/40 p-3 rounded-xl">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Age</p>
                    <p className="text-white font-medium">{identity.age || '-'}</p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-xl">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Sex</p>
                    <p className="text-white font-medium">{identity.sex || '-'}</p>
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-xl">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Height</p>
                    <p className="text-white font-medium">{identity.height ? `${identity.height} cm` : '-'}</p>
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-xl">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Weight</p>
                    <p className="text-white font-medium">{identity.weight ? `${identity.weight} kg` : '-'}</p>
                  </div>
                </div>

                {/* Allergies */}
                {medical.allergies && medical.allergies.length > 0 && (
                  <div className="mb-6">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1.5 text-red-400" /> Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {medical.allergies.map((a: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-red-300 text-xs font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {medical.conditions && medical.conditions.length > 0 && (
                  <div className="mb-6">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {medical.conditions.map((c: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-300 text-xs font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {medical.medications && medical.medications.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Medications</p>
                    <ul className="space-y-1.5">
                      {medical.medications.map((m: string, i: number) => (
                        <li key={i} className="text-slate-300 text-xs pl-2 border-l-2 border-slate-600">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Pending Requests Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                Pending Actions
              </h3>

              <div className="space-y-4">

                {pending.length === 0 && (
                  <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">No pending requests.</p>
                  </div>
                )}

                {pending.map(req => (
                  <div
                    key={req.id}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-yellow-500/30 shadow-lg hover:bg-slate-800/70 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-b border-l border-yellow-500/20">
                      Action Required
                    </div>

                    <div className="mt-2 mb-4">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                        Requesting Physician
                      </p>
                      <p className="text-white font-medium text-lg">{req.doctorId}</p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 mb-5">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Purpose</p>
                      <span className="text-xs text-slate-200 leading-relaxed block">
                        {req.purpose}
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleOpenApproveModal(req)}
                        className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium text-xs flex items-center justify-center shadow-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                      </button>

                      <button
                        onClick={() => {  setSelectedRejectId(req.id);  setActiveModal('deny');}}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-xs flex items-center justify-center border border-slate-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" /> Deny
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* Right Column – Audit Log */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-teal-400" />
                Medical Access History
              </h3>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Date & Time</th>
                      <th className="p-4 font-semibold">Doctor</th>
                      <th className="p-4 font-semibold">Event</th>
                      <th className="p-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    
                    {audit.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500 text-sm">
                          No activity yet.
                        </td>
                      </tr>
                    )}

                    {currentAuditItems.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-slate-400 text-sm font-mono whitespace-nowrap">
                        {formatTimestamp(item.timestamp)}
                      </td>

                        <td className="p-4 text-white text-sm">{item.doctorId}</td>

                        <td className="p-4 text-slate-300 text-sm whitespace-nowrap">
                          {translateEvent(item.event)}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          {item.event === "REQUEST_APPROVED" && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Approved
                            </span>
                          )}

                          {item.event === "REQUEST_REJECTED" && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Denied
                            </span>
                          )}

                          {item.event === "REQUEST_CREATED" && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-xs text-slate-400 font-medium">
                    Page <span className="text-white">{currentPage}</span> of {totalPages}
                  </span>
                  
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* APPROVE MODAL */}
      <Modal
        isOpen={activeModal === 'confirm'}
        onClose={() => setActiveModal('none')}
        title="Confirm Access"
      >
        <div className="space-y-6">
          <div className="flex items-start bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to grant 
              <span className="text-white font-semibold mx-1">{selectedReq?.doctorId}</span> 
              access to your medical data?
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setActiveModal('none')}
              className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg flex items-center min-w-[140px] justify-center"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve Access
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      
     {/* DENY CONFIRMATION MODAL */}
      <Modal
        isOpen={activeModal === 'deny'}
        onClose={() => setActiveModal('none')}
        title="Deny Access Request"
      >
        <div className="space-y-6">
          <div className="flex items-start bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to <span className="text-red-400 font-semibold"> deny</span> 
              this data access request?
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setActiveModal('none')}
              className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmDeny}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg text-sm font-medium"
            >
              Deny Access
            </button>
          </div>
        </div>
      </Modal>


      {/* SUCCESS MODAL */}
      <Modal
        isOpen={activeModal === 'success'}
        onClose={handleCloseSuccess}
      >
        <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/40">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">APPROVED</h3>
     
          <button 
            onClick={handleCloseSuccess}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium"
          >
            OK
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default PatientDashboard;