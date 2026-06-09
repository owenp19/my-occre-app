const { seedRoles } = require('./roleSeeder');
const { seedUsers } = require('./userSeeder');
const { seedNotifications } = require('./notificationSeeder');
const { seedProcedures } = require('./procedureSeeder');
const { seedAppointmentServices } = require('./appointmentServiceSeeder');
const { seedOffices } = require('./officeSeeder');
const { seedTourismTariff } = require('./tourismTariffSeeder');

async function runSeeders() {
  console.log('[Seeders] Iniciando...');

  await seedRoles();
  const userId = await seedUsers();
  await seedNotifications(userId);
  await seedProcedures();
  await seedAppointmentServices();
  await seedOffices();
  await seedTourismTariff();

  console.log('[Seeders] Completado');
}

module.exports = { runSeeders };
