// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { windowsAPI, queueAPI } from '../../services/api';
import socketService from '../../services/socket';

const COLORS = {
  verde: '#00A8B5',
  azul: '#007A85',
  rojo: '#005F6B',
  negro: '#1A2E3B'
};

const OperatorPanel = () => {
  const { ventanillaId } = useParams();
  const [currentWindow, setCurrentWindow] = useState(null);
  const [allWindows, setAllWindows] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (ventanillaId) loadData();
  }, [ventanillaId]);

  useEffect(() => {
    if (!ventanillaId) return;
    socketService.connect();
    socketService.joinOperator(ventanillaId);
    socketService.onTurnCalled(() => loadData());
    return () => socketService.off('turno:llamado');
  }, [ventanillaId]);

  const loadData = async () => {
    try {
      const id = String(ventanillaId);
      const resWindow = await windowsAPI.getById(id);
      setCurrentWindow(resWindow.data.data);
      setAnnouncement(resWindow.data.data.anuncio || '');
      const resAll = await windowsAPI.getActive();
      setAllWindows(resAll.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      await windowsAPI.callNext(String(ventanillaId));
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al llamar turno');
    }
  };

  const handleReCall = async () => {
    try {
      await windowsAPI.reCall(String(ventanillaId));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al re-llamar');
    }
  };

  const handleUpdateAnnouncement = async () => {
    try {
      await windowsAPI.updateAnnouncement(String(ventanillaId), announcement);
      alert('Anuncio actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar anuncio');
    }
  };

  const handleResetQueue = async () => {
    try {
      await queueAPI.reset();
      setConfirmReset(false);
      loadData();
      alert('Cola reseteada correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al resetear la cola');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingText}>Cargando...</div>
      </div>
    );
  }

  if (!currentWindow) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ ...styles.loadingText, color: '#e53e3e' }}>
          Ventanilla no encontrada
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>

      {/* ===== MODAL CONFIRMACIÓN ===== */}
      {confirmReset && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcono}>⚠️</div>
            <h2 style={styles.modalTitulo}>¿Reiniciar contador?</h2>
            <p style={styles.modalTexto}>
              El contador de la ventanilla {currentWindow.numero} volverá a cero.
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalBotones}>
              <button style={styles.btnCancelar} onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
              <button style={styles.btnConfirmar} onClick={handleResetQueue}>
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.card}>
          <div style={styles.headerInner}>
            <div>
              <h1 style={styles.headerTitulo}>Panel Operador</h1>
              <p style={styles.headerSub}>Ventanilla {currentWindow.numero}</p>
            </div>
            <div
              style={{
                ...styles.headerBadge,
                background: `linear-gradient(135deg, ${COLORS[currentWindow.color]}, #1A2E3B)`
              }}
            >
              {currentWindow.numero}
            </div>
          </div>
        </div>

        {/* TURNOS EN PROGRESO */}
        <div style={styles.card}>
          <h2 style={styles.cardTitulo}>Turnos en progreso</h2>
          <div style={styles.turnosGrid}>
            {allWindows.map((w) => (
              <div key={w._id} style={styles.turnoItem}>
                <div style={{ ...styles.turnoHeader, background: COLORS[w.color] }}>
                  V{w.numero}
                </div>
                <div style={styles.turnoNumero}>
                  {w.turnoActual || '000'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES PRINCIPALES */}
        <div style={styles.card}>
          <h2 style={styles.cardTitulo}>Acciones</h2>
          <div style={styles.accionesGrid}>
            <button style={styles.btnLlamar} onClick={handleCallNext}>
              <span style={styles.btnIcono}>🔔</span>
              <span>Llamar Siguiente</span>
            </button>
            <button style={styles.btnReLlamar} onClick={handleReCall}>
              <span style={styles.btnIcono}>🔁</span>
              <span>Re-llamar</span>
            </button>
            <button style={styles.btnReiniciar} onClick={() => setConfirmReset(true)}>
              <span style={styles.btnIcono}>🔄</span>
              <span>Reiniciar Cola</span>
            </button>
          </div>
        </div>

        {/* ANUNCIO */}
        <div style={styles.card}>
          <h2 style={styles.cardTitulo}>Anuncio</h2>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Escribir mensaje para los pacientes..."
            style={styles.textarea}
            rows={3}
            maxLength={200}
          />
          <div style={styles.anuncioFooter}>
            <span style={styles.charCount}>{announcement.length}/200 caracteres</span>
            <button style={styles.btnActualizar} onClick={handleUpdateAnnouncement}>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== ESTILOS =====================
const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E8F7F8 0%, #F5FAFA 60%, #EAF4F5 100%)',
    padding: '24px 16px',
    fontFamily: "'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif",
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0, 95, 107, 0.08)',
    border: '1px solid rgba(0, 168, 181, 0.12)',
  },
  cardTitulo: {
    color: '#1A2E3B',
    fontSize: '15px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #E8F7F8',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitulo: {
    color: '#1A2E3B',
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  headerSub: {
    color: '#5A7A8A',
    fontSize: '15px',
    fontWeight: '500',
    marginTop: '4px',
  },
  headerBadge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '28px',
    fontWeight: '900',
    boxShadow: '0 4px 16px rgba(0, 95, 107, 0.3)',
  },
  turnosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  turnoItem: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  turnoHeader: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
    padding: '6px',
    letterSpacing: '1px',
  },
  turnoNumero: {
    background: '#E8F7F8',
    color: '#1A2E3B',
    fontSize: '24px',
    fontWeight: '800',
    textAlign: 'center',
    padding: '12px 8px',
  },
  accionesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  btnLlamar: {
    background: 'linear-gradient(135deg, #00A8B5, #007A85)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '20px 16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(0, 95, 107, 0.25)',
    letterSpacing: '0.5px',
  },
  btnReLlamar: {
    background: 'linear-gradient(135deg, #243D4D, #1A2E3B)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '20px 16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(26, 46, 59, 0.25)',
    letterSpacing: '0.5px',
  },
  btnReiniciar: {
    background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '20px 16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(229, 62, 62, 0.25)',
    letterSpacing: '0.5px',
    gridColumn: '1 / -1',
  },
  btnIcono: { fontSize: '28px' },
  textarea: {
    width: '100%',
    border: '2px solid #E8F7F8',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#1A2E3B',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
    background: '#FAFEFE',
  },
  anuncioFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: '#5A7A8A',
    fontSize: '13px',
  },
  btnActualizar: {
    background: 'linear-gradient(135deg, #00A8B5, #005F6B)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalIcono: { fontSize: '52px', marginBottom: '16px' },
  modalTitulo: {
    color: '#1A2E3B',
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '12px',
  },
  modalTexto: {
    color: '#5A7A8A',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '28px',
  },
  modalBotones: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  btnCancelar: {
    background: '#E8F7F8',
    color: '#1A2E3B',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnConfirmar: {
    background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
  },
  loadingScreen: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#E8F7F8',
  },
  loadingText: {
    color: '#00A8B5',
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '2px',
  },
};

export default OperatorPanel;