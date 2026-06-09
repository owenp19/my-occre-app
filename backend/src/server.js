require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/database');
const { ensureDatabase, DB_NAME } = require('./config/database');
const path = require('path');
const fs = require('fs');

const { runSeeders } = require('./seeders');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const procedureRoutes = require('./routes/procedures');
const requestRoutes = require('./routes/requests');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const appointmentRoutes = require('./routes/appointments');
const deviceRoutes = require('./routes/devices');
const announcementRoutes = require('./routes/announcements');
const certificateRoutes = require('./routes/certificates');
const tourismCardRoutes = require('./routes/tourismCard');
const { updateCardStatusExpired } = require('./controllers/tourismCardController');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Demo remota: si FRONTEND_URL es '*', permite cualquier origen (solo para pruebas temporales)
const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL === '*'
    ? '*'
    : process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:8100', 'http://localhost:4200', 'capacitor://localhost', 'ionic://localhost'];

const corsConfig = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// credentials true solo si NO se usa origin '*' (incompatible)
if (corsOrigins !== '*') {
  corsConfig.credentials = true;
}

app.use(cors(corsConfig));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});

app.use('/api/', limiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/tourism-card', tourismCardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido (10MB)' });
  }
  if (err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function initDatabase() {
  try {
    await ensureDatabase();
    const connection = await pool.getConnection();

    // First-run only: skip table creation if DB already has tables
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ?`,
      [DB_NAME]
    );
    if (rows[0].cnt > 0) {
      console.log('[DB] Base de datos ya inicializada — saltando creación de tablas');
      connection.release();
      return false;
    }

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
        photo_url TEXT DEFAULT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: users OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: roles OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: user_roles OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS procedure_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        requirements JSON DEFAULT NULL,
        base_cost DECIMAL(12,2) DEFAULT 0,
        estimated_days INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: procedure_types OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_number VARCHAR(20) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        procedure_type_id INT NOT NULL,
        status ENUM('borrador','pendiente','en_revision','devuelto','aprobado','rechazado','finalizado') NOT NULL DEFAULT 'pendiente',
        priority ENUM('baja','normal','alta','urgente') DEFAULT 'normal',
        assigned_to INT DEFAULT NULL,
        notes TEXT,
        internal_notes TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (procedure_type_id) REFERENCES procedure_types(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);
    console.log('[DB] Tabla: requests OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS request_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        user_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        document_type VARCHAR(100) DEFAULT NULL,
        is_validated TINYINT(1) DEFAULT 0,
        validated_by INT DEFAULT NULL,
        validated_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (validated_by) REFERENCES users(id)
      )
    `);
    console.log('[DB] Tabla: request_documents OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS request_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        user_id INT NOT NULL,
        from_status VARCHAR(30) DEFAULT NULL,
        to_status VARCHAR(30) DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('[DB] Tabla: request_history OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointment_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'document-text-outline',
        requires_documents TINYINT(1) DEFAULT 0,
        duration_minutes INT DEFAULT 15,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: appointment_services OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS offices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        phone VARCHAR(30),
        hours_config JSON DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: offices OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        procedure_type_id INT DEFAULT NULL,
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        status ENUM('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (procedure_type_id) REFERENCES procedure_types(id)
      )
    `);

    // Migraciones para columnas faltantes (tabla creada con schema antiguo)
    const migrations = [
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS office_id INT DEFAULT NULL AFTER procedure_type_id`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_code VARCHAR(20) UNIQUE AFTER office_id`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_full_name VARCHAR(200) AFTER appointment_code`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_document_type VARCHAR(50) AFTER citizen_full_name`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_document_number VARCHAR(50) AFTER citizen_document_type`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_email VARCHAR(255) AFTER citizen_document_number`,
      `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_phone VARCHAR(30) AFTER citizen_email`,
    ];
    for (const sql of migrations) {
      try { await connection.execute(sql); } catch { /* columna ya existe */ }
    }

    console.log('[DB] Tabla: appointments OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointment_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        file_size INT,
        file_path VARCHAR(500),
        document_type VARCHAR(100) DEFAULT 'support',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: appointment_documents OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) DEFAULT NULL,
        entity_id INT DEFAULT NULL,
        details JSON DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('[DB] Tabla: audit_log OK');

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
    console.log('[DB] Tabla: notifications OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        platform ENUM('android','ios','web') NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: device_tokens OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INT NOT NULL PRIMARY KEY,
        biometric_enabled TINYINT(1) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: user_preferences OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourism_tariffs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        concept VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'COP',
        active TINYINT(1) DEFAULT 1,
        starts_at TIMESTAMP NULL,
        ends_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: tourism_tariffs OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        document_number VARCHAR(50) NOT NULL,
        birth_date DATE DEFAULT NULL,
        nationality VARCHAR(100) DEFAULT NULL,
        country_residence VARCHAR(100) DEFAULT NULL,
        city_residence VARCHAR(100) DEFAULT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        emergency_contact_name VARCHAR(100) DEFAULT NULL,
        emergency_contact_phone VARCHAR(30) DEFAULT NULL,
        entry_date DATE NOT NULL,
        return_date DATE NOT NULL,
        transport_type VARCHAR(50) DEFAULT NULL,
        airline_or_company VARCHAR(255) DEFAULT NULL,
        flight_number VARCHAR(100) DEFAULT NULL,
        origin_city VARCHAR(100) DEFAULT NULL,
        travel_reason VARCHAR(100) DEFAULT NULL,
        lodging_type VARCHAR(50) DEFAULT NULL,
        lodging_name VARCHAR(255) DEFAULT NULL,
        lodging_address VARCHAR(500) DEFAULT NULL,
        lodging_sector VARCHAR(100) DEFAULT NULL,
        lodging_phone VARCHAR(30) DEFAULT NULL,
        lodging_responsible_name VARCHAR(100) DEFAULT NULL,
        amount DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'COP',
        payment_status ENUM('Pendiente','Pagado','Rechazado','Anulado') DEFAULT 'Pendiente',
        card_status VARCHAR(50) DEFAULT 'Pendiente de pago',
        qr_code TEXT DEFAULT NULL,
        receipt_url TEXT DEFAULT NULL,
        accepted_terms TINYINT(1) DEFAULT 0,
        accepted_location_consent TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: tourist_cards OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_card_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        payment_reference VARCHAR(100) DEFAULT NULL,
        gateway VARCHAR(50) DEFAULT NULL,
        amount DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'COP',
        status VARCHAR(50) DEFAULT 'Pendiente',
        gateway_response JSON DEFAULT NULL,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_card_payments OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_card_receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        receipt_number VARCHAR(50) DEFAULT NULL,
        pdf_path TEXT DEFAULT NULL,
        qr_payload TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_card_receipts OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_location_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        latitude DECIMAL(10,7) DEFAULT NULL,
        longitude DECIMAL(10,7) DEFAULT NULL,
        accuracy DECIMAL(10,2) DEFAULT NULL,
        reason VARCHAR(100) DEFAULT 'voluntario',
        captured_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_location_events OK');

    // Columnas faltantes para tourist_cards
    const cardMigrations = [
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) DEFAULT NULL AFTER card_status`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100) DEFAULT NULL AFTER receipt_number`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS qr_token VARCHAR(36) DEFAULT NULL AFTER payment_reference`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS qr_validation_url TEXT DEFAULT NULL AFTER qr_token`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP NULL AFTER qr_validation_url`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL AFTER issued_at`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es' AFTER expires_at`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS return_time TIME DEFAULT NULL AFTER return_date`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS notify_email TINYINT(1) DEFAULT 1 AFTER accepted_location_consent`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS notify_sms TINYINT(1) DEFAULT 0 AFTER notify_email`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS notify_push TINYINT(1) DEFAULT 0 AFTER notify_sms`,
      `ALTER TABLE tourist_cards ADD COLUMN IF NOT EXISTS reminder_days_before INT DEFAULT 1 AFTER notify_push`,
    ];
    for (const sql of cardMigrations) {
      try { await connection.execute(sql); } catch { /* columna ya existe o no aplica */ }
    }
    console.log('[DB] tourist_cards columnas adicionales OK');

    // Columnas faltantes para tourist_card_payments
    const payMigrations = [
      `ALTER TABLE tourist_card_payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) DEFAULT NULL AFTER payment_reference`,
    ];
    for (const sql of payMigrations) {
      try { await connection.execute(sql); } catch { /* columna ya existe */ }
    }
    console.log('[DB] tourist_card_payments columnas adicionales OK');

    // Columnas faltantes para tourist_card_receipts
    const receiptMigrations = [
      `ALTER TABLE tourist_card_receipts ADD COLUMN IF NOT EXISTS qr_token VARCHAR(36) DEFAULT NULL AFTER qr_payload`,
      `ALTER TABLE tourist_card_receipts ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP NULL AFTER qr_token`,
      `ALTER TABLE tourist_card_receipts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL AFTER issued_at`,
    ];
    for (const sql of receiptMigrations) {
      try { await connection.execute(sql); } catch { /* columna ya existe */ }
    }
    console.log('[DB] tourist_card_receipts columnas adicionales OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_location_consents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        consent_given TINYINT(1) DEFAULT 0,
        consent_type VARCHAR(50) DEFAULT 'entry',
        consented_at TIMESTAMP NULL,
        revoked_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_location_consents OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_return_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        reminder_type ENUM('email','sms','push') NOT NULL DEFAULT 'email',
        remind_at DATETIME NOT NULL,
        sent TINYINT(1) DEFAULT 0,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_return_reminders OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tourist_device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tourist_card_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        platform ENUM('android','ios','web') NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_card_id) REFERENCES tourist_cards(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabla: tourist_device_tokens OK');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        type ENUM('info','alert','important') NOT NULL DEFAULT 'info',
        is_active TINYINT(1) DEFAULT 1,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Tabla: announcements OK');

    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_requests_tracking ON requests(tracking_number)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_to)
    `);

    connection.release();
    console.log('[DB] Todas las tablas verificadas correctamente');
    return true;
  } catch (err) {
    console.error('[DB] Error al inicializar la base de datos:', err);
    process.exit(1);
  }
}

async function start() {
  const firstRun = await initDatabase();
  if (firstRun) {
    await runSeeders();
  }

  // Marcar tarjetas vencidas cada hora
  setInterval(() => updateCardStatusExpired(), 60 * 60 * 1000);
  // Primera ejecución al iniciar
  setTimeout(() => updateCardStatusExpired(), 30 * 1000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] API corriendo en http://localhost:${PORT}`);
    console.log(`[Server] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8100'}`);
  });
}

start();
