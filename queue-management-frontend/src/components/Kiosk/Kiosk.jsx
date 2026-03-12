// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { queueAPI } from '../../services/api';

const Kiosk = () => {
  const [step, setStep] = useState('home'); // 'home' | 'success' | 'misalud' | 'error'
  const [assignedTurn, setAssignedTurn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ===== RELOJ EN TIEMPO REAL =====
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ===== SACAR TURNO =====
  const handleGetTurn = async () => {
    setLoading(true);
    try {
      const response = await queueAPI.getStatus();
      const data = response.data.data;
      const nextTurn = data.turnoActual + 1;
      setAssignedTurn(nextTurn);
      setStep('success');
    } catch (error) {
      console.error('Error al sacar turno:', error);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // ===== IMPRIMIR TICKET =====
  const handlePrint = () => {
    window.print();
    setTimeout(() => setStep('home'), 3000);
  };

  // ===== VOLVER AL HOME =====
  const handleGoHome = () => {
    setStep('home');
    setAssignedTurn(null);
  };

  // ===== PANTALLA MI SALUD DIGITAL =====
  if (step === 'misalud') {
    return (
      <div style={styles.root}>
        <div style={styles.miSaludHeader}>
          <button style={styles.backBtn} onClick={handleGoHome}>
            ← Volver
          </button>
          <span style={styles.miSaludHeaderTitle}>Mi Salud Digital</span>
        </div>
        <iframe
          src="https://www.ms.gba.gov.ar/sitios/misalud/"
          style={styles.iframe}
          title="Mi Salud Digital"
        />
      </div>
    );
  }

  // ===== PANTALLA ÉXITO =====
  if (step === 'success') {
    return (
      <div style={styles.root}>

        {/* ÁREA DE IMPRESIÓN */}
        <div style={styles.printArea} id="ticket">
          <div style={styles.printHeader}>
            <img src="/images/logo.png" alt="HIGA Gandulfo" style={styles.printLogo} />
            <p style={styles.printHospital}>HIGA Luisa C. de Gandulfo</p>
          </div>
          <div style={styles.printTurnContainer}>
            <p style={styles.printLabel}>SU NÚMERO DE TURNO ES</p>
            <p style={styles.printTurnNumber}>
              {String(assignedTurn).padStart(3, '0')}
            </p>
          </div>
          <div style={styles.printFooter}>
            <p style={styles.printDate}>{formatDate(currentTime)}</p>
            <p style={styles.printTime}>{formatTime(currentTime)}</p>
            <p style={styles.printMsg}>Por favor espere a ser llamado</p>
          </div>
        </div>

        {/* BOTONES */}
        <div style={styles.successActions}>
          <button style={styles.printBtn} onClick={handlePrint}>
            <span style={styles.successIcon}>🖨️</span>
            <span>Imprimir Ticket</span>
          </button>
          <button style={styles.homeBtn} onClick={handleGoHome}>
            <span style={styles.successIcon}>🏠</span>
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    );
  }

  // ===== PANTALLA ERROR =====
  if (step === 'error') {
    return (
      <div style={styles.root}>
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2 style={styles.errorTitle}>Error al sacar turno</h2>
          <p style={styles.errorMsg}>Por favor intente nuevamente o consulte al personal</p>
          <button style={styles.retryBtn} onClick={handleGoHome}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ===== PANTALLA HOME =====
  return (
    <div style={styles.root}>

      {/* HEADER */}
      <div style={styles.header}>
        <img src="/images/logo.png" alt="HIGA Gandulfo" style={styles.logo} />
        <h1 style={styles.hospitalName}>HIGA Luisa C. de Gandulfo</h1>
        <p style={styles.hospitalSub}>Sistema de Turnos</p>
      </div>

      {/* RELOJ */}
      <div style={styles.clockContainer}>
        <p style={styles.clockTime}>{formatTime(currentTime)}</p>
        <p style={styles.clockDate}>{formatDate(currentTime)}</p>
      </div>

      {/* BOTÓN PRINCIPAL */}
      <div style={styles.mainAction}>
        <button
          style={{ ...styles.turnBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleGetTurn}
          disabled={loading}
        >
          <span style={styles.turnBtnIcon}>🎫</span>
          <span style={styles.turnBtnText}>
            {loading ? 'Asignando...' : 'SACAR TURNO'}
          </span>
          <span style={styles.turnBtnSub}>Toque para obtener su número</span>
        </button>
      </div>

      {/* DIVISOR */}
      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerText}>o</span>
        <div style={styles.dividerLine} />
      </div>

      {/* BOTÓN MI SALUD DIGITAL */}
      <div style={styles.secondaryAction}>
        <button style={styles.miSaludBtn} onClick={() => setStep('misalud')}>
          <span style={styles.miSaludIcon}>🏥</span>
          <span style={styles.miSaludText}>MI SALUD DIGITAL</span>
          <span style={styles.miSaludSub}>Turnos en línea · Recetas · Historia clínica</span>
        </button>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Si necesita ayuda, consulte al personal de admisión
        </p>
      </div>

    </div>
  );
};

// ===================== ESTILOS (1080x1920 vertical) =====================
const styles = {
  root: {
    width: '1080px',
    minHeight: '1920px',
    background: 'linear-gradient(180deg, #005F6B 0%, #00A8B5 30%, #E8F7F8 60%, #F5FAFA 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
    position: 'relative',
  },

  // ---- HEADER ----
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    paddingBottom: '40px',
    gap: '16px',
  },
  logo: {
    width: '180px',
    height: '180px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(0,0,0,0.2))',
  },
  hospitalName: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: '1px',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
    margin: 0,
    padding: '0 40px',
  },
  hospitalSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '28px',
    fontWeight: '500',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    margin: 0,
  },

  // ---- RELOJ ----
  clockContainer: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px 60px',
    textAlign: 'center',
    marginBottom: '60px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  clockTime: {
    color: 'white',
    fontSize: '96px',
    fontWeight: '900',
    lineHeight: 1,
    margin: 0,
    letterSpacing: '4px',
    textShadow: '0 2px 16px rgba(0,0,0,0.2)',
  },
  clockDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '28px',
    fontWeight: '500',
    margin: '8px 0 0 0',
    textTransform: 'capitalize',
  },

  // ---- BOTÓN PRINCIPAL ----
  mainAction: {
    width: '100%',
    padding: '0 60px',
    marginBottom: '40px',
  },
  turnBtn: {
    width: '100%',
    background: 'white',
    border: 'none',
    borderRadius: '32px',
    padding: '60px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    boxShadow: '0 16px 64px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s',
    WebkitTapHighlightColor: 'transparent',
  },
  turnBtnIcon: {
    fontSize: '96px',
    lineHeight: 1,
  },
  turnBtnText: {
    color: '#005F6B',
    fontSize: '64px',
    fontWeight: '900',
    letterSpacing: '2px',
  },
  turnBtnSub: {
    color: '#5A7A8A',
    fontSize: '28px',
    fontWeight: '500',
  },

  // ---- DIVISOR ----
  divider: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0 60px',
    marginBottom: '40px',
    gap: '20px',
    boxSizing: 'border-box',
  },
  dividerLine: {
    flex: 1,
    height: '2px',
    background: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '28px',
    fontWeight: '500',
  },

  // ---- MI SALUD DIGITAL ----
  secondaryAction: {
    width: '100%',
    padding: '0 60px',
    marginBottom: '60px',
  },
  miSaludBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #1A2E3B, #243D4D)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '32px',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    WebkitTapHighlightColor: 'transparent',
  },
  miSaludIcon: {
    fontSize: '72px',
    lineHeight: 1,
  },
  miSaludText: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '900',
    letterSpacing: '2px',
  },
  miSaludSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '24px',
    fontWeight: '400',
    textAlign: 'center',
  },

  // ---- FOOTER ----
  footer: {
    marginTop: 'auto',
    paddingBottom: '60px',
    textAlign: 'center',
    padding: '0 60px 60px',
  },
  footerText: {
    color: 'rgba(0,95,107,0.6)',
    fontSize: '24px',
    fontWeight: '400',
    textAlign: 'center',
  },

  // ---- SUCCESS ----
  printArea: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 60px',
    gap: '40px',
  },
  printHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  printLogo: {
    width: '120px',
    objectFit: 'contain',
  },
  printHospital: {
    color: '#1A2E3B',
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    margin: 0,
  },
  printTurnContainer: {
    background: 'linear-gradient(135deg, #005F6B, #00A8B5)',
    borderRadius: '40px',
    padding: '60px 120px',
    textAlign: 'center',
    boxShadow: '0 16px 64px rgba(0,95,107,0.3)',
  },
  printLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '32px',
    fontWeight: '600',
    letterSpacing: '4px',
    margin: '0 0 16px 0',
  },
  printTurnNumber: {
    color: 'white',
    fontSize: '200px',
    fontWeight: '900',
    lineHeight: 1,
    margin: 0,
    textShadow: '0 4px 24px rgba(0,0,0,0.2)',
    letterSpacing: '8px',
  },
  printFooter: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  printDate: {
    color: '#1A2E3B',
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
    textTransform: 'capitalize',
  },
  printTime: {
    color: '#5A7A8A',
    fontSize: '40px',
    fontWeight: '700',
    margin: 0,
  },
  printMsg: {
    color: '#5A7A8A',
    fontSize: '28px',
    fontWeight: '400',
    margin: '16px 0 0 0',
    fontStyle: 'italic',
  },
  successActions: {
    width: '100%',
    padding: '0 60px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  printBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #00A8B5, #005F6B)',
    color: 'white',
    border: 'none',
    borderRadius: '28px',
    padding: '48px',
    fontSize: '48px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 32px rgba(0,95,107,0.3)',
    WebkitTapHighlightColor: 'transparent',
  },
  homeBtn: {
    width: '100%',
    background: 'rgba(26,46,59,0.1)',
    color: '#1A2E3B',
    border: '2px solid rgba(26,46,59,0.2)',
    borderRadius: '28px',
    padding: '40px',
    fontSize: '40px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    WebkitTapHighlightColor: 'transparent',
  },
  successIcon: {
    fontSize: '64px',
  },

  // ---- ERROR ----
  errorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '80px 60px',
    textAlign: 'center',
  },
  errorIcon: { fontSize: '120px' },
  errorTitle: {
    color: '#e53e3e',
    fontSize: '56px',
    fontWeight: '900',
    margin: 0,
  },
  errorMsg: {
    color: '#5A7A8A',
    fontSize: '32px',
    fontWeight: '400',
    margin: 0,
  },
  retryBtn: {
    background: 'linear-gradient(135deg, #00A8B5, #005F6B)',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    padding: '40px 80px',
    fontSize: '40px',
    fontWeight: '800',
    cursor: 'pointer',
  },

  // ---- MI SALUD DIGITAL IFRAME ----
  miSaludHeader: {
    width: '100%',
    background: '#005F6B',
    padding: '24px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxSizing: 'border-box',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    padding: '16px 32px',
    fontSize: '28px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  miSaludHeaderTitle: {
    color: 'white',
    fontSize: '36px',
    fontWeight: '800',
  },
  iframe: {
    width: '1080px',
    flex: 1,
    border: 'none',
    height: '1820px',
  },
};

// ===================== ESTILOS DE IMPRESIÓN =====================
const printStyles = `
  @media print {
    body * { visibility: hidden; }
    #ticket, #ticket * { visibility: visible; }
    #ticket {
      position: fixed;
      top: 0; left: 0;
      width: 80mm;
      padding: 8mm;
      font-family: monospace;
    }
  }
`;

// Inyectar estilos de impresión
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}

export default Kiosk;