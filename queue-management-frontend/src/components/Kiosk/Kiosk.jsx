// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { queueAPI } from '../../services/api';
 
const Kiosk = () => {
  const [step, setStep] = useState('home'); // 'home' | 'success' | 'misalud' | 'error'
  const [assignedTurn, setAssignedTurn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [currentTime, setCurrentTime] = useState(new Date());
 
  // ===== RELOJ EN TIEMPO REAL =====
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
  // ===== COUNTDOWN Y VUELTA AL HOME =====
  useEffect(() => {
    if (step !== 'success') return;
    setCountdown(6);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGoHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);
 
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };
 
  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };
 
  const formatTurn = (num) => String(num).padStart(3, '0');
 
  // ===== SACAR TURNO =====
  const handleGetTurn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await queueAPI.getStatus();
      const data = response.data.data;
      const nextTurn = data.turnoActual + 1;
      setAssignedTurn(nextTurn);
      setStep('success');
      // Imprimir automáticamente después de un breve delay
      setTimeout(() => window.print(), 800);
    } catch (error) {
      console.error('Error al sacar turno:', error);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };
 
  const handleGoHome = () => {
    setStep('home');
    setAssignedTurn(null);
  };
 
  // ===== PANTALLA MI SALUD DIGITAL =====
  if (step === 'misalud') {
    return (
      <div style={styles.root}>
        <div style={styles.iframeBar}>
          <button style={styles.backBtn} onClick={handleGoHome}>
            ← Volver
          </button>
          <span style={styles.iframeTitle}>Mi Salud Digital — Provincia de Buenos Aires</span>
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
        <div style={styles.successRoot} id="ticket">
 
          {/* Lado izquierdo — número */}
          <div style={styles.successLeft}>
            <p style={styles.successLabel}>SU TURNO</p>
            <p style={styles.successNumber}>{formatTurn(assignedTurn)}</p>
            <p style={styles.successWait}>Por favor espere a ser llamado</p>
          </div>
 
          {/* Lado derecho — info */}
          <div style={styles.successRight}>
            <img src="/images/logo.png"  alt="HIGA Gandulfo" style={styles.successLogo} />
            <p style={styles.successHospital}>HIGA Luisa C. de Gandulfo</p>
            <div style={styles.successDivider} />
            <p style={styles.successDateTime}>{formatDate(currentTime)}</p>
            <p style={styles.successTime}>{formatTime(currentTime)}</p>
            <div style={styles.successDivider} />
            <p style={styles.successCountdown}>
              Volviendo al inicio en <strong>{countdown}</strong>s
            </p>
          </div>
 
        </div>
      </div>
    );
  }
 
  // ===== PANTALLA ERROR =====
  if (step === 'error') {
    return (
      <div style={styles.root}>
        <div style={styles.errorRoot}>
          <p style={styles.errorTitle}>No se pudo asignar el turno</p>
          <p style={styles.errorSub}>Consulte al personal de admisión</p>
          <button style={styles.errorBtn} onClick={handleGoHome}>
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
        <img src="/images/logo.png" alt="HIGA Gandulfo" style={styles.headerLogo} />
        <div style={styles.headerText}>
          <p style={styles.headerTitle}>HIGA Luisa C. de Gandulfo</p>
          <p style={styles.headerSub}>Sistema de Gestión de Turnos</p>
        </div>
        <div style={styles.headerClock}>
          <p style={styles.clockTime}>{formatTime(currentTime)}</p>
          <p style={styles.clockDate}>{formatDate(currentTime)}</p>
        </div>
      </div>
 
      {/* CONTENIDO PRINCIPAL */}
      <div style={styles.main}>
 
        {/* BOTÓN TURNO */}
        <button
          style={{ ...styles.turnBtn, opacity: loading ? 0.6 : 1 }}
          onClick={handleGetTurn}
          disabled={loading}
        >
          <div style={styles.turnBtnInner}>
            <p style={styles.turnBtnLabel}>
              {loading ? 'Asignando turno...' : 'SACAR TURNO'}
            </p>
            <p style={styles.turnBtnSub}>
              {loading ? 'Por favor espere' : 'Toque aquí para obtener su número'}
            </p>
          </div>
        </button>
 
        {/* SEPARADOR */}
        <div style={styles.separator}>
          <div style={styles.separatorLine} />
          <span style={styles.separatorText}>o</span>
          <div style={styles.separatorLine} />
        </div>
 
        {/* BOTÓN MI SALUD DIGITAL */}
        <button style={styles.miSaludBtn} onClick={() => setStep('misalud')}>
          <div style={styles.miSaludInner}>
            <p style={styles.miSaludLabel}>MI SALUD DIGITAL</p>
            <p style={styles.miSaludSub}>Turnos en línea · Recetas · Historia clínica</p>
          </div>
        </button>
 
      </div>
 
      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Para consultas, diríjase al personal de admisión
        </p>
      </div>
 
    </div>
  );
};
 
// ===================== ESTILOS =====================
const styles = {
  root: {
    width: '100vw',
    height: '100vh',
    background: '#F0F4F5',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
  },
 
  // ---- HEADER ----
  header: {
    background: '#00707A',
    padding: '0 40px',
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexShrink: 0,
  },
  headerLogo: {
    height: '56px',
    objectFit: 'contain',
    
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '0.3px',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '400',
    margin: '2px 0 0 0',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  headerClock: {
    textAlign: 'right',
  },
  clockTime: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '2px',
  },
  clockDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    margin: '2px 0 0 0',
    textTransform: 'capitalize',
  },
 
  // ---- MAIN ----
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '24px',
  },
 
  // ---- BOTÓN TURNO ----
  turnBtn: {
    width: '100%',
    maxWidth: '760px',
    background: 'linear-gradient(135deg, #00707A, #009AA6)',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0, 112, 122, 0.3)',
    WebkitTapHighlightColor: 'transparent',
  },
  turnBtnInner: {
    padding: '48px 40px',
  },
  turnBtnLabel: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '3px',
  },
  turnBtnSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '18px',
    fontWeight: '400',
    margin: '8px 0 0 0',
  },
 
  // ---- SEPARADOR ----
  separator: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '760px',
    gap: '16px',
  },
  separatorLine: {
    flex: 1,
    height: '1px',
    background: '#C8D8DA',
  },
  separatorText: {
    color: '#8AA0A4',
    fontSize: '16px',
  },
 
  // ---- MI SALUD DIGITAL ----
  miSaludBtn: {
    width: '100%',
    maxWidth: '760px',
    background: 'white',
    border: '2px solid #D0E4E6',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    WebkitTapHighlightColor: 'transparent',
  },
  miSaludInner: {
    padding: '36px 40px',
  },
  miSaludLabel: {
    color: '#1A2E3B',
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '2px',
  },
  miSaludSub: {
    color: '#5A7A8A',
    fontSize: '16px',
    margin: '6px 0 0 0',
  },
 
  // ---- FOOTER ----
  footer: {
    background: 'white',
    borderTop: '1px solid #DDE8EA',
    padding: '16px 40px',
    flexShrink: 0,
  },
  footerText: {
    color: '#8AA0A4',
    fontSize: '14px',
    margin: 0,
    textAlign: 'center',
  },
 
  // ---- SUCCESS ----
  successRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },
  successLeft: {
    flex: 1,
    background: 'linear-gradient(135deg, #00707A, #009AA6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  successLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '6px',
    margin: 0,
    textTransform: 'uppercase',
  },
  successNumber: {
    color: 'white',
    fontSize: '220px',
    fontWeight: '900',
    lineHeight: 1,
    margin: 0,
    letterSpacing: '8px',
    textShadow: '0 4px 32px rgba(0,0,0,0.15)',
  },
  successWait: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '20px',
    fontWeight: '400',
    margin: 0,
    fontStyle: 'italic',
  },
  successRight: {
    width: '340px',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px',
    flexShrink: 0,
  },
  successLogo: {
    width: '100px',
    objectFit: 'contain',
  },
  successHospital: {
    color: '#1A2E3B',
    fontSize: '18px',
    fontWeight: '700',
    textAlign: 'center',
    margin: 0,
  },
  successDivider: {
    width: '100%',
    height: '1px',
    background: '#E8F0F1',
  },
  successDateTime: {
    color: '#5A7A8A',
    fontSize: '14px',
    textAlign: 'center',
    margin: 0,
    textTransform: 'capitalize',
  },
  successTime: {
    color: '#1A2E3B',
    fontSize: '40px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '2px',
  },
  successCountdown: {
    color: '#8AA0A4',
    fontSize: '14px',
    textAlign: 'center',
    margin: 0,
  },
 
  // ---- ERROR ----
  errorRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '40px',
  },
  errorTitle: {
    color: '#1A2E3B',
    fontSize: '36px',
    fontWeight: '700',
    margin: 0,
    textAlign: 'center',
  },
  errorSub: {
    color: '#5A7A8A',
    fontSize: '20px',
    margin: 0,
    textAlign: 'center',
  },
  errorBtn: {
    background: '#00707A',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '20px 48px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '16px',
  },
 
  // ---- IFRAME ----
  iframeBar: {
    background: '#00707A',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexShrink: 0,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    padding: '10px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  iframeTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  iframe: {
    width: '100%',
    flex: 1,
    border: 'none',
  },
};
 
// ===================== ESTILOS DE IMPRESIÓN (ticketera 80mm) =====================
const printStyles = `
  @media print {
    @page { margin: 0; size: 80mm auto; }
    body * { visibility: hidden !important; }
    #ticket, #ticket * { visibility: visible !important; }
    #ticket {
      position: fixed !important;
      top: 0; left: 0;
      width: 72mm;
      padding: 4mm;
      background: white !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      font-family: monospace !important;
    }
    #ticket img { width: 40mm !important; height: auto !important; filter: none !important; }
    #ticket p { color: black !important; text-shadow: none !important; }
  }
`;
 
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}
 
export default Kiosk;