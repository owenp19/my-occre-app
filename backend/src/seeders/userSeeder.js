const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedUsers() {
  const email = process.env.SEED_EMAIL || 'owen@occre.app';
  const password = process.env.SEED_PASSWORD || 'owen12345';
  const firstName = process.env.SEED_FIRST_NAME || 'Owen';
  const lastName = process.env.SEED_LAST_NAME || 'OCCRE';

  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  let userId;
  if (existing.length > 0) {
    console.log(`[Seeder] Usuario ya existe (${email}), saltando seed`);
    userId = existing[0].id;
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword]
    );
    userId = result.insertId;
    console.log(`[Seeder] Usuario creado (${email})`);
  }

  const [roleRows] = await pool.execute('SELECT id, name FROM roles');
  const adminRole = roleRows.find(r => r.name === 'admin');

  if (adminRole) {
    const [existingRole] = await pool.execute(
      'SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, adminRole.id]
    );
    if (existingRole.length === 0) {
      await pool.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, adminRole.id]
      );
      console.log(`[Seeder] Rol admin asignado a usuario ${email}`);
    }
  }

  return userId;
}

module.exports = { seedUsers };
