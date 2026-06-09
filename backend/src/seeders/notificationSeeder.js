const pool = require('../config/database');

const SAMPLE_NOTIFICATIONS = [
  { title: 'Trámite actualizado', description: 'Tu solicitud de tarjeta de residencia ha sido aprobada.', type: 'success' },
  { title: 'Documentos requeridos', description: 'Tu trámite de duplicado requiere documentos adicionales.', type: 'alert' },
  { title: 'Recordatorio de cita', description: 'Tienes una cita programada para el próximo 30 de mayo.', type: 'info' },
  { title: 'Pago confirmado', description: 'El pago de tu tarjeta de turismo ha sido recibido.', type: 'success' },
  { title: 'Cambio en horarios', description: 'La OCCRE informa que el horario de atención se modificará en junio.', type: 'alert' },
];

async function seedNotifications(userId) {
  if (!userId) {
    console.log('[Seeder] No userId provided, skipping notifications seed');
    return;
  }

  const [existing] = await pool.execute(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ?',
    [userId]
  );

  if (existing[0].count > 0) {
    console.log(`[Seeder] Notificaciones ya existen para user ${userId}, saltando seed`);
    return;
  }

  for (const n of SAMPLE_NOTIFICATIONS) {
    await pool.execute(
      'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
      [userId, n.title, n.description, n.type]
    );
  }

  console.log(`[Seeder] ${SAMPLE_NOTIFICATIONS.length} notificaciones creadas para user ${userId}`);
}

module.exports = { seedNotifications };
