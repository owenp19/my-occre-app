const pool = require('../config/database');

const OFFICES = [
  {
    name: 'Oficina OCCRE - San Andrés',
    address: 'Av. Francisco Newball, Edificio OCCRE, San Andrés Islas',
    phone: '+57 318 123 4567',
    hours_config: JSON.stringify({
      monday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      tuesday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      wednesday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      thursday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      friday: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      saturday: ['08:00', '09:00', '10:00'],
      sunday: [],
    }),
  },
  {
    name: 'Punto de atención - Providencia',
    address: 'Calle Principal, Providencia Islas',
    phone: '+57 318 987 6543',
    hours_config: JSON.stringify({
      monday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      tuesday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      wednesday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      thursday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      friday: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      saturday: [],
      sunday: [],
    }),
  },
];

async function seedOffices() {
  for (const office of OFFICES) {
    const [existing] = await pool.execute('SELECT id FROM offices WHERE name = ?', [office.name]);
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO offices (name, address, phone, hours_config) VALUES (?, ?, ?, ?)',
        [office.name, office.address, office.phone, office.hours_config]
      );
      console.log(`[Seeder] Oficina creada: ${office.name}`);
    }
  }
}

module.exports = { seedOffices };
