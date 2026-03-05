import { Server } from 'socket.io';

class SocketManager {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.initialize();
  }
  
  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`✅ Cliente conectado: ${socket.id}`);
      
      // La pantalla pública se une a su sala para recibir eventos
      socket.on('pantalla:conectar', () => {
        socket.join('pantalla');
        console.log('📺 Pantalla pública conectada');
      });
      
      // El operador se une a la sala de su ventanilla
      socket.on('operador:conectar', (data) => {
        socket.join(`ventanilla-${data.ventanillaId}`);
        console.log(`👤 Operador conectado a ventanilla ${data.ventanillaId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
      });
    });
  }
  
  getIO() {
    return this.io;
  }
}

export default SocketManager;