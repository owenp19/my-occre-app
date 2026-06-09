const pool = require('../config/database');

const ROLES = [
  { name: 'admin', description: 'Administrador del sistema con acceso completo' },
  { name: 'funcionario', description: 'Funcionario de la OCCRE que gestiona trámites' },
  { name: 'ciudadano', description: 'Usuario ciudadano que realiza trámites' },
];

async function seedRoles() {
  for (const role of ROLES) {
    const [existing] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role.name]);

    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
      console.log(`[Seeder] Rol creado: ${role.name}`);
    } else {
      console.log(`[Seeder] Rol ya existe: ${role.name}`);
    }
  }
}

module.exports = { seedRoles };
