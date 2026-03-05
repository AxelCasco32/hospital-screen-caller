import Window from '../models/window.js';
import Queue from '../models/Queue.js';

class WindowController {

  // GET /api/windows - Obtener todas las ventanillas
  async getAll(req, res) {
    try {
      const windows = await Window.find().sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/windows/active - Obtener solo ventanillas activas
  async getActive(req, res) {
    try {
      const windows = await Window.find({ activa: true }).sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/windows/:id - Obtener ventanilla por ID
  async getById(req, res) {
    try {
      const window = await Window.findById(req.params.id);
      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });
      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/windows/:id/call-next - Llama el siguiente turno de la cola
  async callNext(req, res) {
    try {
      const window = await Window.findById(req.params.id);
      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });

      // Obtener la cola del día y el siguiente turno disponible
      const queue = await Queue.getTodayQueue();
      const next = queue.getNext();

      if (!next) return res.status(400).json({ success: false, message: 'No hay más turnos' });

      const { numero, esUltimo } = queue.assignTurn(window.numero);
      await queue.save();

      // Actualizar ventanilla con el turno asignado
      window.turnoActual = numero;
      window.ultimosLlamados.unshift(numero);
      window.ultimosLlamados = window.ultimosLlamados.slice(0, 5);
      await window.save();

      // Emitir evento en tiempo real a la pantalla pública
      req.io.emit('turno:llamado', {
        ventanilla: window.numero,
        color: window.color,
        turno: numero,
        ultimosLlamados: window.ultimosLlamados
      });

      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/windows/:id/recall - Vuelve a anunciar el turno actual sin avanzar
  async reCall(req, res) {
    try {
      const window = await Window.findById(req.params.id);
      req.io.emit('turno:rellamado', {
        ventanilla: window.numero,
        turno: window.turnoActual
      });
      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/windows/:id/announcement - Actualiza el anuncio visible en pantalla
  async updateAnnouncement(req, res) {
    try {
      const { anuncio } = req.body;
      const window = await Window.findByIdAndUpdate(
        req.params.id,
        { anuncio: anuncio || '' },
        { new: true }
      );

      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });

      // Notificar a la pantalla pública del nuevo anuncio
      req.io.emit('anuncio:actualizado', {
        ventanilla: window.numero,
        anuncio: window.anuncio
      });

      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/windows/:id/clear - Limpia turno, historial y anuncio de la ventanilla
  async clear(req, res) {
    try {
      const window = await Window.findByIdAndUpdate(
        req.params.id,
        { turnoActual: '000', ultimosLlamados: [], anuncio: '' },
        { new: true }
      );
      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/windows/queue/status - Devuelve el estado actual de la cola del día
  async queueStatus(req, res) {
    try {
      const queue = await Queue.getTodayQueue();
      res.json({ success: true, data: queue });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/windows/queue/reset - Reinicia la cola y limpia todas las ventanillas
  async resetQueue(req, res) {
    try {
      const queue = await Queue.getTodayQueue();
      await queue.reset();
      await Window.updateMany({}, { turnoActual: '000', ultimosLlamados: [], anuncio: '' });
      req.io.emit('cola:reseteada', { mensaje: 'Cola reiniciada' });
      res.json({ success: true, message: 'Reiniciado' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/windows/:id/reset-counter - Reinicia solo el contador de una ventanilla
  async resetCounter(req, res) {
    try {
      const window = await Window.findByIdAndUpdate(
        req.params.id,
        { turnoActual: '000', ultimosLlamados: [] },
        { new: true }
      );
      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });
      req.io.emit('turno:llamado', {
        ventanilla: window.numero,
        turno: '000',
        ultimosLlamados: []
      });
      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/windows - Crear nueva ventanilla
  async create(req, res) {
    try {
      const window = new Window(req.body);
      await window.save();
      res.status(201).json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/windows/:id - Eliminar ventanilla
  async delete(req, res) {
    try {
      const window = await Window.findByIdAndDelete(req.params.id);
      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });
      req.io.emit('ventanilla:eliminada', { id: req.params.id, numero: window.numero });
      res.json({ success: true, message: `Ventanilla ${window.numero} eliminada` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/windows/:id/toggle - Activar o desactivar ventanilla
  async toggleActive(req, res) {
    try {
      const window = await Window.findById(req.params.id);
      if (!window) return res.status(404).json({ success: false, message: 'No encontrada' });
      window.activa = !window.activa;
      await window.save();
      res.json({ success: true, data: window });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}

const controller = new WindowController();

// Bindear métodos para que no pierdan el contexto this
Object.getOwnPropertyNames(WindowController.prototype)
  .filter(method => method !== 'constructor')
  .forEach(method => {
    controller[method] = controller[method].bind(controller);
  });

export default controller;