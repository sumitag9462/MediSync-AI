import React from "react";
import { useLocation } from "react-router-dom";

const MedicineSecretPage = () => {
  const location = useLocation();
  const medicine = location.state?.medicine;

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white p-6 bg-gray-900">
        <p className="text-xl">No medicine selected</p>
      </div>
    );
  }

  const { name, brand, info } = medicine;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 md:px-12">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{name}</h1>
        {brand && (
          <p className="text-gray-400 italic text-lg">Brand: {brand}</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Infobox */}
        <div className="md:w-1/3 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 sticky top-20 h-fit space-y-4">
          <h2 className="text-xl font-bold mb-2 border-b border-gray-600 pb-2">
            Quick Info
          </h2>
          {Object.entries(info).map(([key, value]) => (
            <div key={key}>
              <p className="text-gray-400 font-semibold mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}:
              </p>
              <p className="text-gray-200 text-sm">{value || "No info available"}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="md:w-2/3 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Overview
            </h2>
            <p className="text-gray-200">{info.purpose || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Usage
            </h2>
            <p className="text-gray-200">{info.usage || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Warnings & Precautions
            </h2>
            <p className="text-gray-200 mb-1">{info.warnings || "No info available"}</p>
            {info.precautions && <p className="text-gray-200">{info.precautions}</p>}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Side Effects
            </h2>
            <p className="text-gray-200">{info.sideEffects || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Mechanism of Action
            </h2>
            <p className="text-gray-200">{info.mechanism || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Pharmacokinetics
            </h2>
            <p className="text-gray-200">{info.pharmacokinetics || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Interactions
            </h2>
            <p className="text-gray-200">{info.interactions || "No info available"}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-3 border-b border-gray-700 pb-1">
              Patient Tips
            </h2>
            <p className="text-gray-200">{info.patientTips || "No info available"}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MedicineSecretPage;
