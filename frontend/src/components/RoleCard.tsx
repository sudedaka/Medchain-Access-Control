import React from 'react';
import { ArrowRight, type LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  description: string;
  gradient: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, icon: Icon, onClick, description, gradient }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start justify-between w-full md:w-80 h-96 p-8
      bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]
      hover:-translate-y-2 transition-all duration-500 ease-out text-left overflow-hidden"
    >
      {/* Gradient Glow Effect on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

      <div className="relative z-10 w-full">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
          bg-gradient-to-br ${gradient} shadow-lg text-white`}>
          <Icon className="w-7 h-7" strokeWidth={2} />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
          {title}
        </h2>
        
        <p className="text-slate-300 text-sm leading-relaxed font-light">
          {description}
        </p>
      </div>

      <div className="relative z-10 w-full pt-6 mt-auto border-t border-white/10 flex items-center justify-between group-hover:text-white text-slate-400 transition-colors">
        <span className="text-sm font-medium tracking-wide">ENTER PORTAL</span>
        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default RoleCard;