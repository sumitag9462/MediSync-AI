import React from "react";
import { useLocation } from "react-router-dom";

const MedicineSecretPage = () => {
  const location = useLocation();
  const medicine = location.state?.medicine;

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 p-6 bg-slate-50 font-sans">
        <p className="text-xl font-medium">No medicine selected</p>
      </div>
    );
  }

  const { name, brand, info } = medicine;

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-purple-500/20">
      {/* Animated Background System - Light Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto z-10 relative py-12 px-4 md:px-12 pb-24">
        {/* Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-3">{name}</h1>
          {brand && (
            <p className="text-purple-600 font-bold text-xl inline-block bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 shadow-sm">Brand: {brand}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Infobox */}
          <div className="md:w-1/3 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 sticky top-24 h-fit space-y-6 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-3 flex items-center gap-2 tracking-tight">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>Quick Info
            </h2>
            <div className="space-y-4">
              {Object.entries(info).map(([key, value]) => (
                <div key={key}>
                  <p className="text-slate-400 font-bold mb-1 text-xs uppercase tracking-widest">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </p>
                  <p className="text-slate-700 text-sm font-medium">{value || "No info available"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="md:w-2/3 space-y-8">
            <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 tracking-tight">Overview</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{info.purpose || "No info available"}</p>
            </section>

            <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 tracking-tight">Usage</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{info.usage || "No info available"}</p>
            </section>

            <section className="bg-red-50/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-red-100 hover:shadow-[0_20px_40px_rgba(239,68,68,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-red-600 mb-4 border-b border-red-100 pb-3 tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>Warnings & Precautions
              </h2>
              <p className="text-slate-700 font-medium leading-relaxed mb-3">{info.warnings || "No info available"}</p>
              {info.precautions && <p className="text-slate-700 font-medium leading-relaxed">{info.precautions}</p>}
            </section>

            <section className="bg-amber-50/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-amber-100 hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-amber-600 mb-4 border-b border-amber-100 pb-3 tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>Side Effects
              </h2>
              <p className="text-slate-700 font-medium leading-relaxed">{info.sideEffects || "No info available"}</p>
            </section>

            <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 tracking-tight">Mechanism of Action</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{info.mechanism || "No info available"}</p>
            </section>

            <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 tracking-tight">Pharmacokinetics</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{info.pharmacokinetics || "No info available"}</p>
            </section>

            <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 tracking-tight">Interactions</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{info.interactions || "No info available"}</p>
            </section>

            <section className="bg-emerald-50/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-emerald-100 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all">
              <h2 className="text-2xl font-extrabold text-emerald-600 mb-4 border-b border-emerald-100 pb-3 tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>Patient Tips
              </h2>
              <p className="text-slate-700 font-medium leading-relaxed">{info.patientTips || "No info available"}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineSecretPage;
