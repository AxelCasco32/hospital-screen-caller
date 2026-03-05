import mongoose from 'mongoose';

const windowSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true,
        unique: true 
    },
    color: {
        type: String, 
        enum: ['verde', 'azul', 'rojo', 'negro'],  
        default: 'verde'
    },
    turnoActual: {  
        type: String,
        default: '000'
    },
    ultimosLlamados: [{
        type: String
    }],
    anuncio: {
        type: String,
        default: '',
        maxlength: 200
    },
    activa: {
        type: Boolean,
        default: true  
    },
    operador: { 
        type: String,
        default: ''
    }
}, { timestamps: true }); 


// ===== MÉTODOS DE INSTANCIA =====

/**
 * Asigna un turno a la ventanilla y lo agrega al historial de últimos llamados.
 * Mantiene un máximo de 10 turnos en el historial (los más recientes primero).
 * Se usa cuando el operador llama un turno desde su panel.
 */
windowSchema.methods.assignTurn = function(numeroTurno) {
  this.turnoActual = numeroTurno; 
  
  this.ultimosLlamados.unshift(numeroTurno);
  if (this.ultimosLlamados.length > 10) {
    this.ultimosLlamados = this.ultimosLlamados.slice(0, 10);
  }
  
  return this.save();
};

/**
 * Actualiza el texto del anuncio visible en la pantalla pública.
 * El anuncio tiene un máximo de 200 caracteres (definido en el schema).
 */
windowSchema.methods.updateAnnouncement = function(texto) {
  this.anuncio = texto;
  return this.save();
};

/**
 * Limpia el estado de la ventanilla: resetea el turno actual a '000',
 * borra el historial de llamados y elimina el anuncio activo.
 * Se usa desde el panel admin o al resetear la cola completa.
 */
windowSchema.methods.clear = function() {
  this.turnoActual = '000';  
  this.ultimosLlamados = [];
  this.anuncio = '';
  return this.save();
};

const Window = mongoose.model('Ventanilla', windowSchema);
export default Window;