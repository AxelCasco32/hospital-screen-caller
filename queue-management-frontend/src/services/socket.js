// @ts-nocheck
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Conectar al servidor de sockets
  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket conectado:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket desconectado');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error);
      });
    }

    return this.socket;
  }

  // Desconectar del servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Unirse como pantalla pública
  joinScreen() {
    if (this.socket) {
      this.socket.emit('pantalla:conectar');
      console.log('📺 Conectado como pantalla pública');
    }
  }

  // Unirse como operador de ventanilla
  joinOperator(windowId) {
    if (this.socket) {
      this.socket.emit('operador:conectar', { ventanillaId: windowId });
      console.log(`👤 Conectado como operador (Ventanilla ${windowId})`);
    }
  }

  // Escuchar evento: turno llamado
  onTurnCalled(callback) {
    if (this.socket) {
      this.socket.on('turno:llamado', callback);
    }
  }

  // Escuchar evento: turno re-llamado
  onTurnReCalled(callback) {
    if (this.socket) {
      this.socket.on('turno:rellamado', callback);
    }
  }

  // Escuchar evento: anuncio actualizado
  onAnnouncementUpdated(callback) {
    if (this.socket) {
      this.socket.on('anuncio:actualizado', callback);
    }
  }

  // Escuchar evento: cola completada
  onQueueCompleted(callback) {
    if (this.socket) {
      this.socket.on('cola:completada', callback);
    }
  }

  // Escuchar evento: ventanilla limpiada
  onWindowCleared(callback) {
    if (this.socket) {
      this.socket.on('ventanilla:limpiada', callback);
    }
  }

  // Remover listener de un evento
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Obtener instancia del socket
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();