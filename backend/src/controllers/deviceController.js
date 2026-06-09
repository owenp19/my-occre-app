const pool = require('../config/database');

exports.registerToken = async (req, res) => {
  const userId = req.user.id;
  const { token, platform } = req.body;

  if (!token || !platform) {
    return res.status(400).json({ error: 'Token y plataforma son requeridos' });
  }

  if (!['android', 'ios', 'web'].includes(platform)) {
    return res.status(400).json({ error: 'Plataforma no válida. Use: android, ios o web' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM device_tokens WHERE user_id = ? AND token = ?',
      [userId, token]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE device_tokens SET is_active = 1, platform = ? WHERE id = ?',
        [platform, existing[0].id]
      );
      return res.json({ message: 'Token actualizado' });
    }

    await pool.execute(
      'INSERT INTO device_tokens (user_id, token, platform) VALUES (?, ?, ?)',
      [userId, token, platform]
    );

    res.status(201).json({ message: 'Dispositivo registrado para notificaciones' });
  } catch (err) {
    console.error('[DeviceToken] Error:', err);
    res.status(500).json({ error: 'Error al registrar dispositivo' });
  }
};

exports.unregisterToken = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token es requerido' });
  }

  try {
    await pool.execute(
      'UPDATE device_tokens SET is_active = 0 WHERE user_id = ? AND token = ?',
      [userId, token]
    );
    res.json({ message: 'Dispositivo desregistrado' });
  } catch (err) {
    console.error('[DeviceToken] Error:', err);
    res.status(500).json({ error: 'Error al desregistrar dispositivo' });
  }
};

exports.getMyTokens = async (req, res) => {
  const userId = req.user.id;

  try {
    const [tokens] = await pool.execute(
      'SELECT id, token, platform, is_active, created_at FROM device_tokens WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ tokens });
  } catch (err) {
    console.error('[DeviceToken] Error:', err);
    res.status(500).json({ error: 'Error al obtener dispositivos' });
  }
};
