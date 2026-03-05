import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Window from './src/models/window.js';
import Queue from './src/models/Queue.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar colecciones
    await Window.deleteMany({});
    await Queue.deleteMany({});
    console.log('🧹 Colecciones limpiadas');
    
    // Crear ventanillas
    const windows = [
      { numero: 3, color: 'rojo', turnoActual: '000', operador: 'Operador 1' },
      { numero: 5, color: 'verde', turnoActual: '000', operador: 'Operador 2' },
      { numero: 7, color: 'azul', turnoActual: '000', operador: 'Operador 3' }
    ];
    
    await Window.insertMany(windows);
    console.log('✅ 3 ventanillas creadas');
    
    // Crear cola del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const queue = new Queue({
      fecha: today,
      turnoActual: 0,
      turnosDisponibles: Array.from({ length: 100 }, (_, i) => i + 1),
      turnosLlamados: []
    });
    
    await queue.save();
    console.log('✅ Cola creada (turnos 1-100)');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Base de datos inicializada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allWindows = await Window.find();
    console.log('\n📋 Ventanillas:');
    allWindows.forEach(w => {
      console.log(`  - Ventanilla ${w.numero} (${w.color}) - ID: ${w._id}`);
    });
    
    console.log('\n📋 Cola:');
    console.log(`  - Turnos disponibles: ${queue.turnosDisponibles.length}`);
    console.log(`  - Próximo turno: ${queue.getNext()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();