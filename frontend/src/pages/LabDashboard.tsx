import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope, Upload, Database, ChevronDown } from 'lucide-react';

const LabDashboard: React.FC = () => {
  const navigate = useNavigate();
  const labId = localStorage.getItem("userId");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState('Genomic Sequencing');

  const testOptions = ['Genomic Sequencing', 'Blood Analysis', 'Pathology Report' ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
        {/* Background Elements */}
       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-slate-400 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <header className="flex items-center mb-10 border-b border-slate-800 pb-8">
          <div className="p-4 bg-purple-500/20 rounded-2xl mr-6 border border-purple-500/30">
            <Microscope className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Laboratory Portal</h1>
            <p className="text-slate-400">
            Logged in as: <span className="text-blue-300 font-semibold">{labId}</span>
           </p>

            <p className="text-slate-400">Securely upload and transmit medical test results.</p>
          </div>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden mb-8 shadow-2xl">
            <div className="p-6 bg-purple-900/20 border-b border-purple-500/20 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-purple-200 flex items-center">
                    <Database className="w-5 h-5 mr-3" />
                    Laboratory Data Entry
                </h2>
            </div>
            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Patient ID</label>
                        <input type="text" className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="e.g. PT-49201" />
                    </div>
                    
                    {/* Custom Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Test Type</label>
                        <button 
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full p-4 bg-slate-900/50 border rounded-xl text-white text-left flex justify-between items-center outline-none transition-all cursor-pointer
                            ${isDropdownOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-600 hover:border-purple-500/70'}
                          `}
                        >
                            {selectedTest}
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                          <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {testOptions.map((option) => (
                              <div
                                key={option}
                                onClick={() => {
                                  setSelectedTest(option);
                                  setIsDropdownOpen(false);
                                }}
                                className="p-4 text-slate-300 hover:bg-purple-600 hover:text-white cursor-pointer transition-colors border-b border-slate-700/50 last:border-0"
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                </div>

                 <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Drag and drop result file here, or click to browse</span>
                    <span className="text-xs text-slate-600 mt-2">Supports .PDF, .DICOM, .JSON</span>
                </div>
                <div className="mt-8 flex justify-end">
                    <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 font-bold shadow-lg shadow-purple-900/40 transition-all transform hover:-translate-y-1">
                        Encrypt & Upload to Chain
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;