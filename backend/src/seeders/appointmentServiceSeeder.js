const pool = require('../config/database');

const SERVICES = [
  {
    name: 'Trámites de tarjeta OCCRE',
    slug: 'tarjeta-occre',
    description: 'Mi primera tarjeta, renovación, duplicado, correcciones, etc.',
    icon: 'document-text-outline',
    requires_documents: 1,
    duration_minutes: 15,
  },
  {
    name: 'Permiso temporal de trabajador foráneo',
    slug: 'trabajador-foraneo',
    description: 'Vinculación laboral o permanencia temporal.',
    icon: 'people-outline',
    requires_documents: 1,
    duration_minutes: 20,
  },
  {
    name: 'Consulta de estado de trámite',
    slug: 'consulta-estado',
    description: 'Revisa el estado de tu solicitud o radicado.',
    icon: 'document-text-outline',
    requires_documents: 0,
    duration_minutes: 10,
  },
  {
    name: 'Orientación general',
    slug: 'orientacion-general',
    description: 'Información sobre trámites y requisitos.',
    icon: 'chatbubble-ellipses',
    requires_documents: 0,
    duration_minutes: 15,
  },
];

async function seedAppointmentServices() {
  for (const svc of SERVICES) {
    const [existing] = await pool.execute('SELECT id FROM appointment_services WHERE slug = ?', [svc.slug]);
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO appointment_services (name, slug, description, icon, requires_documents, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [svc.name, svc.slug, svc.description, svc.icon, svc.requires_documents, svc.duration_minutes]
      );
      console.log(`[Seeder] Servicio de cita creado: ${svc.name}`);
    }
  }
}

module.exports = { seedAppointmentServices };
