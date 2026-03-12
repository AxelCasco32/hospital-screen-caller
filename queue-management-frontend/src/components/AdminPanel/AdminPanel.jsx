// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { windowsAPI, queueAPI } from '../../services/api';

const COLORS = {
  verde: '#00A8B5',
  azul: '#007A85',
  rojo: '#005F6B',
  negro: '#1A2E3B'
};

const AdminPanel = () => {
  const [windows, setWindows] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('estadisticas');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // guarda la ventanilla a eliminar
  const [logoPreview, setLogoPreview] = useState('/images/logo.png');
  const [successMessage, setSuccessMessage] = useState('');

  // Estado formulario nueva ventanilla
  const [newForm, setNewForm] = useState({ numero: '', color: 'verde', operador: '' });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resWindows, resQueue] = await Promise.all([
        windowsAPI.getAll(),
        queueAPI.getStatus()
      ]);
      setWindows(resWindows.data.data);
      setQueue(resQueue.data.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (mensaje) => {
    setSuccessMessage(mensaje);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ===== CREAR VENTANILLA =====
  const handleCreateWindow = async () => {
    setFormError('');
    if (!newForm.numero) return setFormError('El número es obligatorio');
    if (isNaN(newForm.numero) || Number(newForm.numero) <= 0) return setFormError('El número debe ser mayor a 0');
    if (windows.some(w => w.numero === Number(newForm.numero))) return setFormError('Ya existe una ventanilla con ese número');

    setCreating(true);
    try {
      await windowsAPI.create({
        numero: Number(newForm.numero),
        color: newForm.color,
        operador: newForm.operador,
        turnoActual: '000',
        activa: true
      });
      setNewForm({ numero: '', color: 'verde', operador: '' });
      await loadData();
      showSuccess(`Ventanilla ${newForm.numero} creada correctamente`);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error al crear la ventanilla');
    } finally {
      setCreating(false);
    }
  };

  // ===== ELIMINAR VENTANILLA =====
  const handleDeleteWindow = async () => {
    if (!confirmDelete) return;
    try {
      await windowsAPI.delete(confirmDelete._id);
      setConfirmDelete(null);
      await loadData();
      showSuccess(`Ventanilla ${confirmDelete.numero} eliminada`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ===== TOGGLE ACTIVA =====
  const handleToggleWindow = async (id, currentActive) => {
    try {
      await windowsAPI.toggleActive(id);
      await loadData();
      showSuccess(`Ventanilla ${currentActive ? 'desactivada' : 'activada'} correctamente`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ===== RESETEAR COLA =====
  const handleResetQueue = async () => {
    try {
      await queueAPI.reset();
      setConfirmReset(false);
      loadData();
      showSuccess('Cola reseteada correctamente');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChangeLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      showSuccess('Logo actualizado en vista previa. Para aplicarlo permanentemente, copiá el archivo a /public/images/logo.png');
    };
    reader.readAsDataURL(file);
  };

  // ===== ESTADÍSTICAS =====
  const totalTurnos = queue?.turnosAsignados?.length || 0;
  const turnosPendientes = queue?.turnos?.filter(t => t.estado === 'pendiente')?.length || 0;
  const turnosAtendidos = queue?.turnos?.filter(t => t.estado === 'asignado')?.length || 0;
  const activeWindows = windows.filter(w => w.activa).length;

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingText}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={styles.root}>

      {/* ===== MODAL RESET COLA ===== */}
      {confirmReset && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcono}>⚠️</div>
            <h2 style={styles.modalTitulo}>¿Resetear cola completa?</h2>
            <p style={styles.modalTexto}>
              Se reiniciarán todos los turnos y ventanillas del día. Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalBotones}>
              <button style={styles.btnCancelar} onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button style={styles.btnConfirmar} onClick={handleResetQueue}>Sí, resetear</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ELIMINAR VENTANILLA ===== */}
      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcono}>🗑️</div>
            <h2 style={styles.modalTitulo}>¿Eliminar Ventanilla {confirmDelete.numero}?</h2>
            <p style={styles.modalTexto}>
              Se eliminará permanentemente la ventanilla {confirmDelete.numero}. Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalBotones}>
              <button style={styles.btnCancelar} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={styles.btnConfirmar} onClick={handleDeleteWindow}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ÉXITO ===== */}
      {successMessage && (
        <div style={styles.toast}>✅ {successMessage}</div>
      )}

      <div style={styles.layout}>

        {/* ===== SIDEBAR ===== */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <img src={logoPreview} alt="Logo" style={styles.sidebarLogoImg} />
          </div>
          <p style={styles.sidebarTitulo}>Panel Admin</p>
          <p style={styles.sidebarSub}>HIGA Gandulfo</p>

          <nav style={styles.nav}>
            {[
              { id: 'estadisticas', label: 'Estadísticas', icono: '📊' },
              { id: 'ventanillas', label: 'Ventanillas', icono: '🏢' },
              { id: 'logo', label: 'Cambiar Logo', icono: '🖼️' },
              { id: 'cola', label: 'Gestión Cola', icono: '🔄' },
            ].map(item => (
              <button
                key={item.id}
                style={{ ...styles.navBtn, ...(activeSection === item.id ? styles.navBtnActivo : {}) }}
                onClick={() => setActiveSection(item.id)}
              >
                <span style={styles.navIcono}>{item.icono}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <div style={styles.main}>

          {/* ===== ESTADÍSTICAS ===== */}
          {activeSection === 'estadisticas' && (
            <div>
              <h1 style={styles.pageTitulo}>Estadísticas del día</h1>
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTop: '4px solid #00A8B5' }}>
                  <div style={styles.statNumero}>{turnosAtendidos}</div>
                  <div style={styles.statLabel}>Turnos atendidos</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #007A85' }}>
                  <div style={styles.statNumero}>{turnosPendientes}</div>
                  <div style={styles.statLabel}>Turnos pendientes</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #005F6B' }}>
                  <div style={styles.statNumero}>{totalTurnos}</div>
                  <div style={styles.statLabel}>Total del día</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #1A2E3B' }}>
                  <div style={styles.statNumero}>{activeWindows}</div>
                  <div style={styles.statLabel}>Ventanillas activas</div>
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>Turno actual por ventanilla</h2>
                <div style={styles.ventanillasStatsGrid}>
                  {windows.filter(w => w.activa).map((w) => (
                    <div key={w._id} style={styles.ventanillaStatItem}>
                      <div style={{ ...styles.ventanillaStatHeader, background: `linear-gradient(135deg, ${COLORS[w.color] || COLORS.verde}, #1A2E3B)` }}>
                        Ventanilla {w.numero}
                      </div>
                      <div style={styles.ventanillaStatNumero}>{w.turnoActual || '000'}</div>
                      <div style={styles.ventanillaStatUltimos}>
                        {w.ultimosLlamados?.slice(0, 3).map((t, i) => (
                          <span key={i} style={styles.ultimoBadge}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== GESTIÓN VENTANILLAS ===== */}
          {activeSection === 'ventanillas' && (
            <div>
              <h1 style={styles.pageTitulo}>Gestión de Ventanillas</h1>

              {/* FORMULARIO CREAR */}
              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>➕ Nueva Ventanilla</h2>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Número</label>
                    <input
                      type="number"
                      min="1"
                      value={newForm.numero}
                      onChange={e => setNewForm(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="Ej: 4"
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Color</label>
                    <select
                      value={newForm.color}
                      onChange={e => setNewForm(prev => ({ ...prev, color: e.target.value }))}
                      style={styles.formInput}
                    >
                      <option value="verde">Verde</option>
                      <option value="azul">Azul</option>
                      <option value="rojo">Rojo</option>
                      <option value="negro">Negro</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Operador</label>
                    <input
                      type="text"
                      value={newForm.operador}
                      onChange={e => setNewForm(prev => ({ ...prev, operador: e.target.value }))}
                      placeholder="Nombre del operador"
                      style={styles.formInput}
                    />
                  </div>
                </div>

                {/* Preview color */}
                <div style={styles.colorPreview}>
                  <div style={{ ...styles.colorDot, background: COLORS[newForm.color] }} />
                  <span style={styles.colorLabel}>Vista previa: Ventanilla {newForm.numero || '?'}</span>
                </div>

                {formError && <p style={styles.errorMsg}>⚠️ {formError}</p>}

                <button
                  style={{ ...styles.btnCrear, opacity: creating ? 0.7 : 1 }}
                  onClick={handleCreateWindow}
                  disabled={creating}
                >
                  {creating ? 'Creando...' : '➕ Crear Ventanilla'}
                </button>
              </div>

              {/* LISTA VENTANILLAS */}
              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>Ventanillas registradas ({windows.length})</h2>
                <div style={styles.ventanillasList}>
                  {windows.map((w) => (
                    <div key={w._id} style={styles.ventanillaRow}>
                      <div style={{ ...styles.ventanillaBadge, background: COLORS[w.color] || COLORS.verde }}>
                        {w.numero}
                      </div>
                      <div style={styles.ventanillaInfo}>
                        <div style={styles.ventanillaNombre}>Ventanilla {w.numero}</div>
                        <div style={styles.ventanillaDetalle}>
                          Color: {w.color} · Turno actual: {w.turnoActual || '000'} {w.operador ? `· ${w.operador}` : ''}
                        </div>
                      </div>
                      <div style={styles.ventanillaAcciones}>
                        {/* Toggle activa */}
                        <div
                          style={{ ...styles.toggleSwitch, background: w.activa ? '#00A8B5' : '#C8DDE0' }}
                          onClick={() => handleToggleWindow(w._id, w.activa)}
                        >
                          <div style={{ ...styles.toggleThumb, transform: w.activa ? 'translateX(24px)' : 'translateX(2px)' }} />
                        </div>
                        <span style={{ ...styles.toggleLabel, color: w.activa ? '#00A8B5' : '#A8D8DC' }}>
                          {w.activa ? 'Activa' : 'Inactiva'}
                        </span>
                        {/* Botón eliminar */}
                        <button
                          style={styles.btnEliminar}
                          onClick={() => setConfirmDelete(w)}
                          title="Eliminar ventanilla"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== CAMBIAR LOGO ===== */}
          {activeSection === 'logo' && (
            <div>
              <h1 style={styles.pageTitulo}>Cambiar Logo</h1>
              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>Logo actual</h2>
                <div style={styles.logoPreviewBox}>
                  <img src={logoPreview} alt="Logo actual" style={styles.logoPreviewImg} />
                </div>
                <p style={styles.logoDescripcion}>
                  Seleccioná una imagen para previsualizar el nuevo logo. Para aplicarlo permanentemente,
                  copiá el archivo a <code style={styles.code}>/public/images/logo.png</code>.
                </p>
                <label style={styles.btnSubirLogo}>
                  🖼️ Seleccionar nuevo logo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChangeLogo} />
                </label>
              </div>
            </div>
          )}

          {/* ===== GESTIÓN COLA ===== */}
          {activeSection === 'cola' && (
            <div>
              <h1 style={styles.pageTitulo}>Gestión de Cola</h1>
              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>Estado actual</h2>
                <div style={styles.colaEstado}>
                  <div style={styles.colaItem}>
                    <span style={styles.colaLabel}>Turnos totales hoy</span>
                    <span style={styles.colaValor}>{totalTurnos}</span>
                  </div>
                  <div style={styles.colaItem}>
                    <span style={styles.colaLabel}>Atendidos</span>
                    <span style={{ ...styles.colaValor, color: '#00A8B5' }}>{turnosAtendidos}</span>
                  </div>
                  <div style={styles.colaItem}>
                    <span style={styles.colaLabel}>Pendientes</span>
                    <span style={{ ...styles.colaValor, color: '#005F6B' }}>{turnosPendientes}</span>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.card, border: '1px solid rgba(229, 62, 62, 0.2)', marginTop: 20 }}>
                <h2 style={{ ...styles.cardTitulo, color: '#c53030' }}>Zona de peligro</h2>
                <p style={styles.reinicioDescripcion}>
                  Resetea la cola completa del día y pone todas las ventanillas en cero.
                </p>
                <button style={styles.btnReiniciar} onClick={() => setConfirmReset(true)}>
                  <span>🔄</span>
                  <span>Resetear cola completa</span>
                </button>
              </div>
            </div>
          )}

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
    fontFamily: "'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif",
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    minHeight: '100vh',
  },
  sidebar: {
    background: 'linear-gradient(180deg, #1A2E3B 0%, #005F6B 100%)',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarLogo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  sidebarLogoImg: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
  },
  sidebarTitulo: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: '1px',
    margin: 0,
  },
  sidebarSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '24px',
    marginTop: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    padding: '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
  },
  navBtnActivo: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
  },
  navIcono: { fontSize: '18px' },
  main: {
    padding: '32px',
    overflowY: 'auto',
  },
  pageTitulo: {
    color: '#1A2E3B',
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0, 95, 107, 0.08)',
    border: '1px solid rgba(0, 168, 181, 0.12)',
    marginBottom: '20px',
  },
  cardTitulo: {
    color: '#1A2E3B',
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #E8F7F8',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    color: '#5A7A8A',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  formInput: {
    border: '2px solid #E8F7F8',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '15px',
    color: '#1A2E3B',
    outline: 'none',
    background: '#FAFEFE',
    fontFamily: 'inherit',
  },
  colorPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  colorDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  colorLabel: {
    color: '#5A7A8A',
    fontSize: '13px',
    fontWeight: '600',
  },
  errorMsg: {
    color: '#e53e3e',
    fontSize: '13px',
    marginBottom: '12px',
    fontWeight: '600',
  },
  btnCrear: {
    background: 'linear-gradient(135deg, #00A8B5, #005F6B)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 95, 107, 0.2)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0, 95, 107, 0.08)',
    textAlign: 'center',
  },
  statNumero: {
    color: '#1A2E3B',
    fontSize: '48px',
    fontWeight: '900',
    lineHeight: 1,
    marginBottom: '8px',
  },
  statLabel: {
    color: '#5A7A8A',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  ventanillasStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  ventanillaStatItem: {
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  ventanillaStatHeader: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    padding: '10px 14px',
    letterSpacing: '1px',
  },
  ventanillaStatNumero: {
    background: '#E8F7F8',
    color: '#1A2E3B',
    fontSize: '36px',
    fontWeight: '900',
    textAlign: 'center',
    padding: '16px',
  },
  ventanillaStatUltimos: {
    background: 'white',
    padding: '8px 12px',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  ultimoBadge: {
    background: '#E8F7F8',
    color: '#005F6B',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  ventanillasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ventanillaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#FAFEFE',
    borderRadius: '14px',
    border: '1px solid #E8F7F8',
  },
  ventanillaBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px',
    fontWeight: '900',
    flexShrink: 0,
  },
  ventanillaInfo: { flex: 1 },
  ventanillaNombre: {
    color: '#1A2E3B',
    fontSize: '16px',
    fontWeight: '700',
  },
  ventanillaDetalle: {
    color: '#5A7A8A',
    fontSize: '13px',
    marginTop: '2px',
  },
  ventanillaAcciones: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  toggleSwitch: {
    width: '52px',
    height: '28px',
    borderRadius: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.3s',
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    width: '22px',
    height: '22px',
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s',
  },
  toggleLabel: {
    fontSize: '13px',
    fontWeight: '700',
    minWidth: '52px',
  },
  btnEliminar: {
    background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(229, 62, 62, 0.2)',
  },
  logoPreviewBox: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px',
    background: '#F5FAFA',
    borderRadius: '14px',
    marginBottom: '16px',
    border: '2px dashed #A8D8DC',
  },
  logoPreviewImg: {
    height: '140px',
    objectFit: 'contain',
  },
  logoDescripcion: {
    color: '#5A7A8A',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  code: {
    background: '#E8F7F8',
    color: '#005F6B',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
  btnSubirLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #00A8B5, #005F6B)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 95, 107, 0.2)',
  },
  colaEstado: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  colaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#F5FAFA',
    borderRadius: '12px',
    border: '1px solid #E8F7F8',
  },
  colaLabel: {
    color: '#5A7A8A',
    fontSize: '14px',
    fontWeight: '600',
  },
  colaValor: {
    color: '#1A2E3B',
    fontSize: '24px',
    fontWeight: '800',
  },
  reinicioDescripcion: {
    color: '#5A7A8A',
    fontSize: '14px',
    marginBottom: '16px',
  },
  btnReiniciar: {
    background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '16px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 16px rgba(229, 62, 62, 0.25)',
    width: '100%',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.5)',
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
  toast: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1A2E3B',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 2000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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

export default AdminPanel;