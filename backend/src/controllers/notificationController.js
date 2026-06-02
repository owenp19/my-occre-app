const pool = require('../config/database');

async function getNotifications(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, description, type, \`read\`, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const notifications = rows.map((n) => ({
      id: String(n.id),
      title: n.title,
      description: n.description,
      type: n.type,
      read: Boolean(n.read),
      date: n.created_at,
    }));

    res.json({ notifications });
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

async function markAsRead(req, res) {
  const { id } = req.params;

  try {
    await pool.execute(
      'UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    console.error('Error al marcar notificación:', err);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
}

async function markAllAsRead(req, res) {
  try {
    await pool.execute(
      'UPDATE notifications SET `read` = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    console.error('Error al marcar notificaciones:', err);
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
}

async function getUnreadCount(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND `read` = 0',
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error al obtener conteo:', err);
    res.status(500).json({ error: 'Error al obtener conteo' });
  }
}

async function clearAll(req, res) {
  try {
    await pool.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Notificaciones eliminadas' });
  } catch (err) {
    console.error('Error al eliminar notificaciones:', err);
    res.status(500).json({ error: 'Error al eliminar notificaciones' });
  }
}

async function seedNotifications(req, res) {
  try {
    const sampleNotifications = [
      { title: 'Trámite actualizado', description: 'Tu solicitud de tarjeta de residencia ha sido aprobada. Revisa los detalles en Mis trámites.', type: 'success' },
      { title: 'Documentos requeridos', description: 'Tu trámite de duplicado requiere documentos adicionales. Ingresa para ver los detalles.', type: 'alert' },
      { title: 'Recordatorio de cita', description: 'Tienes una cita programada para el próximo 30 de mayo en la oficina de la OCCRE.', type: 'info' },
      { title: 'Pago confirmado', description: 'El pago de tu tarjeta de turismo ha sido recibido y está en proceso de validación.', type: 'success' },
      { title: 'Cambio en horarios', description: 'La OCCRE informa que el horario de atención se modificará durante el mes de junio.', type: 'alert' },
    ];

    for (const n of sampleNotifications) {
      await pool.execute(
        'INSERT INTO notifications (user_id, title, description, type) VALUES (?, ?, ?, ?)',
        [req.user.id, n.title, n.description, n.type]
      );
    }

    res.status(201).json({ message: 'Notificaciones de ejemplo creadas' });
  } catch (err) {
    console.error('Error al crear notificaciones de ejemplo:', err);
    res.status(500).json({ error: 'Error al crear notificaciones de ejemplo' });
  }
}

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, clearAll, seedNotifications };
