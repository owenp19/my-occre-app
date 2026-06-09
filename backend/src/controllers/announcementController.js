const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [announcements] = await pool.execute(
      'SELECT id, title, body, type, is_active, published_at, created_at FROM announcements ORDER BY published_at DESC'
    );
    res.json({ announcements });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    res.status(500).json({ error: 'Error al cargar comunicados' });
  }
};

exports.getActive = async (req, res) => {
  try {
    const [announcements] = await pool.execute(
      "SELECT id, title, body, type, published_at FROM announcements WHERE is_active = 1 AND published_at <= NOW() ORDER BY published_at DESC"
    );
    res.json({ announcements });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    res.status(500).json({ error: 'Error al cargar comunicados' });
  }
};

exports.create = async (req, res) => {
  const { title, body, type } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Título y contenido son requeridos' });
  }

  const validTypes = ['info', 'alert', 'important'];
  const annType = validTypes.includes(type) ? type : 'info';

  try {
    const [result] = await pool.execute(
      'INSERT INTO announcements (title, body, type, is_active, published_at) VALUES (?, ?, ?, 1, NOW())',
      [title, body, annType]
    );

    await pool.execute(
      'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'Crear comunicado', 'announcement', result.insertId, JSON.stringify({ title })]
    );

    res.status(201).json({ message: 'Comunicado creado', id: result.insertId });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    res.status(500).json({ error: 'Error al crear comunicado' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, body, type, isActive } = req.body;

  try {
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (body !== undefined) { fields.push('body = ?'); values.push(body); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    fields.push('published_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    await pool.execute(
      'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'Actualizar comunicado', 'announcement', id, JSON.stringify({ title })]
    );

    res.json({ message: 'Comunicado actualizado' });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    res.status(500).json({ error: 'Error al actualizar comunicado' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM announcements WHERE id = ?', [id]);

    await pool.execute(
      'INSERT INTO audit_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'Eliminar comunicado', 'announcement', id]
    );

    res.json({ message: 'Comunicado eliminado' });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    res.status(500).json({ error: 'Error al eliminar comunicado' });
  }
};
