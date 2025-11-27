import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Check, X, Shield } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const  patientId = localStorage.getItem("userId"); 
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
       {/* Background Elements */}
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

            <p className="text-slate-400">Control who accesses your medical data.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Pending Requests */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                Pending Actions
            </h3>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-yellow-500/30 relative overflow-hidden shadow-lg shadow-yellow-900/10">
                <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-bl-xl border-b border-l border-yellow-500/20">
                    ACTION REQUIRED
                </div>
                
                <div className="mt-4 mb-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Requesting Physician</p>
                    <p className="text-white font-medium text-lg">Dr. Osman Doluca</p>
                    <p className="text-slate-500 text-xs mt-1">Izmir Econ. Hospital</p>
                </div>
                
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 mb-6">
                    <p className="text-slate-400 text-xs mb-2">Requested Data:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-600">Blood Test Results</span>
                        <span className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-600">Genomic Profile</span>
                    </div>
                </div>
                
                <div className="flex space-x-2">
                    <button className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center">
                        <Check className="w-4 h-4 mr-1" /> Approve
                    </button>
                    <button className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all font-medium text-sm flex items-center justify-center border border-slate-600">
                        <X className="w-4 h-4 mr-1" /> Deny
                    </button>
                </div>
            </div>
          </div>

          {/* Right Column: Blockchain Access History (Replaces "View Audit Log" button) */}
          <div className="lg:col-span-2">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-teal-400" />
                    Blockchain Access History
                </h3>
            
             </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Date & Time</th>
                                <th className="p-4 font-semibold">Accessor (Doctor)</th>
                                <th className="p-4 font-semibold">Data Accessed</th>
                                <th className="p-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 text-slate-400 text-sm font-mono">2024-05-18 14:30</td>
                                <td className="p-4 text-white font-medium text-sm">Dr. Alice Chen</td>
                                <td className="p-4 text-slate-300 text-sm">Pathology Report</td>
                                <td className="p-4 text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        Approved
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 text-slate-400 text-sm font-mono">2024-05-15 09:15</td>
                                <td className="p-4 text-white font-medium text-sm">Dr. Osman Doluca</td>
                                <td className="p-4 text-slate-300 text-sm">MRI Scan</td>
                                <td className="p-4 text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        Approved
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 text-slate-400 text-sm font-mono">2024-05-10 11:20</td>
                                <td className="p-4 text-white font-medium text-sm">Dr. John Smith</td>
                                <td className="p-4 text-slate-300 text-sm">Genomic Profile</td>
                                <td className="p-4 text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                        Denied
                                    </span>
                                </td>
                            </tr>
                             <tr className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 text-slate-400 text-sm font-mono">2024-04-22 16:45</td>
                                <td className="p-4 text-white font-medium text-sm">Lab Tech #442</td>
                                <td className="p-4 text-slate-300 text-sm">Upload: Blood Test</td>
                                <td className="p-4 text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        Logged
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;