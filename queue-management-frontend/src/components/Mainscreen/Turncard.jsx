// @ts-nocheck
import React from 'react';
import { COLORS } from '../../utils/constants';

const TurnCard = ({ window }) => {
  const colorClass = COLORS[window.color] || 'bg-gray-600';

  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700 transform transition-all hover:scale-105 ${colorClass}`}>
      {/* Contenedor del Número */}
      <div className="bg-white/10 backdrop-blur-sm p-8 text-center">
        <span className="block text-8xl font-black tracking-tighter text-white drop-shadow-md">
          {window.turnoActual || '---'}
        </span>
      </div>

      {/* Info de la Ventanilla */}
      <div className="bg-black/20 p-4 text-center">
        <p className="text-xl uppercase font-bold text-white/80 tracking-widest">
          Ventanilla
        </p>
        <p className="text-5xl font-black text-white">
          {window.numero}
        </p>
      </div>

      {/* Anuncio de la ventanilla (si existe) */}
      {window.anuncio && (
        <div className="bg-yellow-400 p-2 text-center">
          <p className="text-black font-bold animate-pulse text-lg">
            {window.anuncio}
          </p>
        </div>
      )}
    </div>
  );
};

export default TurnCard;