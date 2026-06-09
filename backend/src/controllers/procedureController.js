const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM procedure_types WHERE is_active = 1 ORDER BY name ASC'
    );

    res.json({
      procedures: rows.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        requirements: p.requirements ? JSON.parse(p.requirements) : [],
        baseCost: p.base_cost,
        estimatedDays: p.estimated_days,
        isActive: Boolean(p.is_active),
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    console.error('Error al obtener trámites:', err);
    res.status(500).json({ error: 'Error al obtener trámites' });
  }
}

async function getBySlug(req, res) {
  const { slug } = req.params;
  const isId = /^\d+$/.test(slug);

  try {
    const [rows] = await pool.execute(
      isId
        ? 'SELECT * FROM procedure_types WHERE id = ?'
        : 'SELECT * FROM procedure_types WHERE slug = ?',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    const p = rows[0];
    res.json({
      procedure: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        requirements: p.requirements ? JSON.parse(p.requirements) : [],
        baseCost: p.base_cost,
        estimatedDays: p.estimated_days,
        isActive: Boolean(p.is_active),
        createdAt: p.created_at,
      },
    });
  } catch (err) {
    console.error('Error al obtener trámite:', err);
    res.status(500).json({ error: 'Error al obtener trámite' });
  }
}

async function create(req, res) {
  const { name, slug, description, requirements, baseCost, estimatedDays } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Nombre y slug son obligatorios' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO procedure_types (name, slug, description, requirements, base_cost, estimated_days)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, slug, description || '', requirements ? JSON.stringify(requirements) : '[]', baseCost || 0, estimatedDays || 0]
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'create_procedure_type', 'procedure_type', result.insertId, JSON.stringify({ name, slug }), req.ip]
    );

    res.status(201).json({ message: 'Trámite creado exitosamente', id: result.insertId });
  } catch (err) {
    console.error('Error al crear trámite:', err);
    res.status(500).json({ error: 'Error al crear trámite' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, slug, description, requirements, baseCost, estimatedDays, isActive } = req.body;

  try {
    await pool.execute(
      `UPDATE procedure_types
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           requirements = COALESCE(?, requirements),
           base_cost = COALESCE(?, base_cost),
           estimated_days = COALESCE(?, estimated_days),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, slug, description, requirements ? JSON.stringify(requirements) : null, baseCost, estimatedDays, isActive, id]
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'update_procedure_type', 'procedure_type', id, JSON.stringify(req.body), req.ip]
    );

    res.json({ message: 'Trámite actualizado exitosamente' });
  } catch (err) {
    console.error('Error al actualizar trámite:', err);
    res.status(500).json({ error: 'Error al actualizar trámite' });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    await pool.execute('UPDATE procedure_types SET is_active = 0 WHERE id = ?', [id]);

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'deactivate_procedure_type', 'procedure_type', id, '{}', req.ip]
    );

    res.json({ message: 'Trámite desactivado exitosamente' });
  } catch (err) {
    console.error('Error al desactivar trámite:', err);
    res.status(500).json({ error: 'Error al desactivar trámite' });
  }
}

module.exports = { getAll, getBySlug, create, update, remove };
