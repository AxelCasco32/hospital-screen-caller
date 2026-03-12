// @ts-nocheck
import React from 'react';

const RecentTurns = ({ windows = [] }) => {
  // Combinar todos los últimos llamados de todas las ventanillas
  const allRecentCalls = windows
    .flatMap(w =>
      (w.ultimosLlamados || []).slice(0, 5).map(turno => ({
        turno,
        ventanilla: w.numero
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp) // Opcional: ordenar por los más recientes
    .slice(0, 10);

  if (allRecentCalls.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
      <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
        <span>📋</span> Últimos Turnos Llamados
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {allRecentCalls.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-700/50 p-3 rounded-xl border-l-4 border-blue-500 flex flex-col items-center justify-center animate-fadeIn"
          >
            <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">
              Turno
            </span>
            <span className="text-3xl font-black text-white">
              {item.turno}
            </span>
            <span className="text-sm font-medium text-blue-300 mt-1">
              Ventanilla {item.ventanilla}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTurns;