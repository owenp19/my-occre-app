require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        document_type VARCHAR(10) DEFAULT NULL,
        document_number VARCHAR(50) DEFAULT NULL,
        phone VARCHAR(30) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('success','info','alert') NOT NULL DEFAULT 'info',
        \`read\` TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['owenpusey1@gmail.com']
    );

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('12345678', 12);
      const [result] = await connection.execute(
        `INSERT INTO users (first_name, last_name, email, password)
         VALUES (?, ?, ?, ?)`,
        ['Owen', 'Pusey', 'owenpusey1@gmail.com', hashedPassword]
      );
      console.log('[Seed] Usuario Owen Pusey creado (owenpusey1@gmail.com / 12345678)');

      const sampleNotifications = [
        { title: 'Trámite actualizado', description: 'Tu solicitud de tarjeta de residencia ha sido aprobada.', type: 'success' },
        { title: 'Documentos requeridos', description: 'Tu trámite de duplicado requiere documentos adicionales.', type: 'alert' },
        { title: 'Recordatorio de cita', description: 'Tienes una cita programada para el próximo 30 de mayo.', type: 'info' },
        { title: 'Pago confirmado', description: 'El pago de tu tarjeta de turismo ha sido recibido.', type: 'success' },
        { title: 'Cambio en horarios', description: 'La OCCRE informa que el horario de atención se modificará en junio.', type: 'alert' },
      ];

      for (const n of sampleNotifications) {
        await connection.execute(
          'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
          [result.insertId, n.title, n.description, n.type]
        );
      }
      console.log('[Seed] Notificaciones de ejemplo creadas para Owen Pusey');
    }

    connection.release();
    console.log('[DB] Tablas verificadas correctamente');
  } catch (err) {
    console.error('[DB] Error al inicializar la base de datos:', err);
    process.exit(1);
  }
}

async function start() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`[Server] API corriendo en http://localhost:${PORT}`);
  });
}

start();
