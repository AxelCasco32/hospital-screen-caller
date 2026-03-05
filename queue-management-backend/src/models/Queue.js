import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    unique: true
  },
  
  turnoActual: {
    type: Number,
    default: 0
  },
  
  turnosDisponibles: [{
    type: Number
  }],
  
  turnosLlamados: [{
    numero: Number,
    ventanilla: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  resetAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });


// ===== MÉTODOS ESTÁTICOS =====

/**
 * Obtiene la cola del día actual. Si no existe, la crea automáticamente
 * con 100 turnos disponibles (del 1 al 100).
 * Se usa en casi todos los endpoints del controller.
 */
queueSchema.statics.getTodayQueue = async function() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let queue = await this.findOne({ fecha: hoy });
  
  if (!queue) {
    queue = await this.create({
      fecha: hoy,
      turnoActual: 0,
      turnosDisponibles: Array.from({ length: 100 }, (_, i) => i + 1),
      turnosLlamados: []
    });
    
    console.log('✅ Nueva cola creada para hoy');
  }
  
  return queue;
};


// ===== MÉTODOS DE INSTANCIA =====

/**
 * Devuelve el primer turno disponible sin sacarlo de la lista.
 * Retorna null si no quedan turnos.
 */
queueSchema.methods.getNext = function() {
  if (this.turnosDisponibles.length === 0) {
    return null;
  }
  return this.turnosDisponibles[0];
};

/**
 * Asigna el siguiente turno a una ventanilla.
 * - Saca el primer turno de turnosDisponibles (shift)
 * - Lo registra en turnosLlamados con ventanilla y timestamp
 * - Si se llega al turno 100, resetea la cola automáticamente
 * - Retorna el número formateado (ej: "007"), el número real y si es el último
 */
queueSchema.methods.assignTurn = function(ventanillaNumero) {
  const siguienteTurno = this.turnosDisponibles.shift();
  
  if (!siguienteTurno) {
    throw new Error('No hay más turnos disponibles');
  }
  
  const numeroFormateado = String(siguienteTurno).padStart(3, '0');
  
  this.turnosLlamados.push({
    numero: siguienteTurno,
    ventanilla: ventanillaNumero,
    timestamp: new Date()
  });
  
  this.turnoActual = siguienteTurno;
  
  // Al llegar al turno 100 se reinicia automáticamente para el siguiente ciclo
  if (siguienteTurno === 100) {
    console.log('🔄 Turno 100 alcanzado. Cola se reiniciará.');
    this.turnoActual = 0;
    this.turnosDisponibles = Array.from({ length: 100 }, (_, i) => i + 1);
    this.turnosLlamados = [];
    this.resetAt = new Date();
  }
  
  return { 
    numero: numeroFormateado, 
    turno: siguienteTurno, 
    esUltimo: siguienteTurno === 100 
  };
};

/**
 * Resetea la cola manualmente desde el panel admin.
 * Vuelve todos los turnos a disponibles y limpia el historial.
 */
queueSchema.methods.reset = function() {
  this.turnoActual = 0;
  this.turnosDisponibles = Array.from({ length: 100 }, (_, i) => i + 1);
  this.turnosLlamados = [];
  this.resetAt = new Date();
  return this.save();
};

const Queue = mongoose.model('Cola', queueSchema);
export default Queue;