const pool = require('../config/database');

const PROCEDURES = [
  {
    name: 'Mi primera tarjeta OCCRE',
    slug: 'first-occre-card',
    description: 'Orientación para solicitar por primera vez la tarjeta OCCRE para residentes en San Andrés Islas.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía o documento de identidad',
      'Certificado de residencia',
      'Carta laboral o certificación de ingresos',
      'Formulario de solicitud diligenciado',
      'Fotografía reciente 3x4',
      'Comprobante de pago de tasas',
    ]),
    estimated_days: 15,
  },
  {
    name: 'Cambio de tarjeta de identidad a cédula',
    slug: 'id-card-change',
    description: 'Actualización del documento asociado a la tarjeta OCCRE por cambio de identidad a cédula.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía',
      'Tarjeta de identidad anterior',
      'Formulario de actualización',
      'Fotografía reciente 3x4',
    ]),
    estimated_days: 10,
  },
  {
    name: 'Requisitos para inversionistas',
    slug: 'investors',
    description: 'Información documental para personas o empresas inversionistas que deseen establecer residencia.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía o NIT',
      'Registro mercantil vigente',
      'Estados financieros últimos 2 años',
      'Certificación de inversión mínima',
      'Carta de intención de inversión',
      'Cámara de comercio',
    ]),
    estimated_days: 20,
  },
  {
    name: 'Duplicado de tarjeta OCCRE',
    slug: 'duplicate-card',
    description: 'Solicitud de duplicado por pérdida, deterioro u otra causal debidamente justificada.',
    requirements: JSON.stringify([
      'Documento de identidad',
      'Denuncio por pérdida (si aplica)',
      'Formulario de solicitud de duplicado',
      'Comprobante de pago',
      'Fotografía reciente 3x4',
    ]),
    estimated_days: 10,
  },
  {
    name: 'Independiente primera vez',
    slug: 'independent-first-time',
    description: 'Checklist para solicitantes independientes que realizan el trámite inicial de residencia.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía',
      'Certificado de ingresos independientes',
      'Declaración de renta último año',
      'Certificado de residencia',
      'Fotografía 3x4',
      'Formulario de solicitud',
    ]),
    estimated_days: 15,
  },
  {
    name: 'Corrección de tarjeta OCCRE',
    slug: 'card-correction',
    description: 'Corrección de datos personales, tipo de residencia u otra información registrada en la tarjeta OCCRE.',
    requirements: JSON.stringify([
      'Documento de identidad',
      'Tarjeta OCCRE actual',
      'Soporte del dato a corregir',
      'Formulario de solicitud de corrección',
    ]),
    estimated_days: 8,
  },
  {
    name: 'Residencia por convivencia',
    slug: 'residence-cohabitation',
    description: 'Trámite para beneficiario y otorgante que acrediten vínculo de convivencia permanente.',
    requirements: JSON.stringify([
      'Documentos de identidad de ambos',
      'Certificado de convivencia o unión marital',
      'Declaración juramentada de convivencia',
      'Fotografías de cada solicitante',
      'Formulario de solicitud conjunto',
    ]),
    estimated_days: 15,
  },
  {
    name: 'Pasajero en comisión',
    slug: 'commission-passenger',
    description: 'Orientación para comisión temporal, entidad solicitante y familiares.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía',
      'Carta de la entidad solicitante',
      'Certificación laboral',
      'Cronograma de comisión',
      'Formulario de solicitud',
    ]),
    estimated_days: 5,
  },
  {
    name: 'Trabajador foráneo o tratamiento especial',
    slug: 'foreign-worker',
    description: 'Requisitos para trabajador foráneo, empresa contratante y núcleo familiar.',
    requirements: JSON.stringify([
      'Cédula de ciudadanía',
      'Contrato laboral vigente',
      'Certificación de la empresa',
      'Soporte de vivienda temporal',
      'Documentos del núcleo familiar',
      'Formulario de solicitud',
    ]),
    estimated_days: 12,
  },
];

async function seedProcedures() {
  for (const proc of PROCEDURES) {
    const [existing] = await pool.execute('SELECT id FROM procedure_types WHERE slug = ?', [proc.slug]);

    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO procedure_types (name, slug, description, requirements, estimated_days)
         VALUES (?, ?, ?, ?, ?)`,
        [proc.name, proc.slug, proc.description, proc.requirements, proc.estimated_days]
      );
      console.log(`[Seeder] Trámite creado: ${proc.name}`);
    } else {
      console.log(`[Seeder] Trámite ya existe: ${proc.name}`);
    }
  }
}

module.exports = { seedProcedures };
