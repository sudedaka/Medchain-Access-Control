import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, FileSearch, Activity, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("userId");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
       
      <div className="max-w-6xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-slate-400 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-blue-500/20 rounded-2xl mr-6 border border-blue-500/30">
            <Stethoscope className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Doctor Portal</h1>
             <p className="text-slate-400">
             Logged in as: <span className="text-blue-300 font-semibold">{doctorId}</span>
            </p>
            <p className="text-slate-400">Manage patient data requests and view medical records.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Request Data Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl mr-4 group-hover:bg-blue-500/30 transition-colors">
                <FileSearch className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Request Access</h2>
            </div>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Initiate a new request to access a patient's medical history or genetic data. The patient will be notified to grant consent.
            </p>
            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium">
              New Data Request
            </button>
          </div>

          {/* View Records Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-teal-500/50 transition-colors group">
            <div className="flex items-center mb-6">
               <div className="p-3 bg-teal-500/20 rounded-xl mr-4 group-hover:bg-teal-500/30 transition-colors">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Authorized Records</h2>
            </div>
             <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              View laboratory results and patient records for which you have received active consent via the blockchain ledger.
            </p>
            <button className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-medium border border-slate-600">
              View Authorized Database
            </button>
          </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-500" />
              Recent Requests & Activity
            </h3>
            <div className="bg-slate-800/30 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/3">Patient Identity</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/3">Data Type</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/3 text-right">Status</span>
                </div>
                
                {/* Item 1 */}
                <div className="p-4 flex justify-between items-center border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col w-1/3">
                        <span className="text-sm font-mono text-white font-medium">ID: #PT-8291</span>
                        <span className="text-xs text-slate-500 mt-1 flex items-center">
                           <Clock className="w-3 h-3 mr-1" /> 2 mins ago
                        </span>
                    </div>
                    <div className="w-1/3">
                       <span className="text-sm text-slate-300">Genomic Sequencing</span>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <AlertCircle className="w-3 h-3 mr-1.5" />
                          Pending Consent
                      </span>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 flex justify-between items-center border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col w-1/3">
                        <span className="text-sm font-mono text-white font-medium">ID: #PT-4921</span>
                        <span className="text-xs text-slate-500 mt-1 flex items-center">
                           <Clock className="w-3 h-3 mr-1" /> 2 hours ago
                        </span>
                    </div>
                    <div className="w-1/3">
                       <span className="text-sm text-slate-300">Blood Analysis</span>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                           <CheckCircle className="w-3 h-3 mr-1.5" />
                          Access Granted
                      </span>
                    </div>
                </div>

                 {/* Item 3 */}
                 <div className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col w-1/3">
                        <span className="text-sm font-mono text-white font-medium">ID: #PT-1102</span>
                        <span className="text-xs text-slate-500 mt-1 flex items-center">
                           <Clock className="w-3 h-3 mr-1" /> 1 day ago
                        </span>
                    </div>
                    <div className="w-1/3">
                       <span className="text-sm text-slate-300">Pathology Report</span>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                           <AlertCircle className="w-3 h-3 mr-1.5" />
                          Access Denied
                      </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;