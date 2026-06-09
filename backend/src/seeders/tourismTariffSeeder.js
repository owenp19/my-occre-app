const pool = require('../config/database');

async function seedTourismTariff() {
  try {
    const [existing] = await pool.execute('SELECT id FROM tourism_tariffs LIMIT 1');
    if (existing.length > 0) {
      console.log('[Seeders] tourism_tariffs ya tiene datos, omitiendo');
      return;
    }

    await pool.execute(
      `INSERT INTO tourism_tariffs (concept, amount, currency, active, starts_at)
       VALUES ('Tarjeta de Turismo', 153000, 'COP', 1, NOW())`
    );
    console.log('[Seeders] tourism_tariffs: tarifa por defecto creada ($153.000 COP)');
  } catch (err) {
    console.error('[Seeders] Error al sembrar tourism_tariffs:', err.message);
  }
}

module.exports = { seedTourismTariff };
