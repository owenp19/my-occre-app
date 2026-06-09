const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const CERTS_DIR = path.resolve('uploads/certificates');
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

exports.generateCertificate = async (req, res) => {
  const { trackingNumber } = req.params;

  try {
    const [requests] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.submitted_at, r.resolved_at,
              r.notes, pt.name as procedure_name, pt.slug as procedure_slug,
              u.first_name, u.last_name, u.document_type, u.document_number,
              CONCAT(u2.first_name, ' ', u2.last_name) as assigned_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users u2 ON r.assigned_to = u2.id
       WHERE r.tracking_number = ?`,
      [trackingNumber]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const request = requests[0];

    if (request.status !== 'aprobado' && request.status !== 'finalizado') {
      return res.status(400).json({ error: 'Solo se pueden generar constancias para solicitudes aprobadas o finalizadas' });
    }

    const qrData = JSON.stringify({
      type: 'occre_certificate',
      tracking: request.tracking_number,
      status: request.status,
      citizen: `${request.first_name} ${request.last_name}`,
      doc: `${request.document_type || ''} ${request.document_number || ''}`,
      procedure: request.procedure_name,
      issued: new Date().toISOString(),
    });

    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#1d72b5', light: '#ffffff' },
    });

    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    const filename = `constancia_${request.tracking_number}.pdf`;
    const filepath = path.join(CERTS_DIR, filename);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const primaryColor = '#1d72b5';
    const secondaryColor = '#f39218';
    const darkColor = '#071a2f';

    doc.rect(0, 0, doc.page.width, 8).fill(primaryColor);

    doc.fontSize(22).font('Helvetica-Bold').fillColor(darkColor);
    doc.text('OCCRE', 50, 30);
    doc.fontSize(10).font('Helvetica').fillColor('#5c6b7a');
    doc.text('Oficina de Control, Circulación y Residencia', 50, 55);
    doc.text('San Andrés, Providencia y Santa Catalina', 50, 68);

    const sealX = doc.page.width - 160;
    doc.fontSize(8).fillColor('#5c6b7a');
    doc.text('Código de validación', sealX, 30, { width: 110, align: 'right' });
    doc.fontSize(7).fillColor('#9aa3ae');
    doc.text(request.tracking_number, sealX, 43, { width: 110, align: 'right' });

    doc.moveTo(50, 88).lineTo(doc.page.width - 50, 88).strokeColor('#e0e4e8').stroke();

    doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor);
    doc.text('CONSTANCIA DE TRÁMITE', 50, 105, { align: 'center' });

    doc.fontSize(10).font('Helvetica').fillColor(darkColor);
    doc.text('La OCCRE certifica que:', 50, 135, { align: 'center' });

    doc.fontSize(13).font('Helvetica-Bold').fillColor(darkColor);
    doc.text(`${request.first_name} ${request.last_name}`, 50, 155, { align: 'center' });

    doc.fontSize(10).font('Helvetica').fillColor(darkColor);
    const docLine = `${request.document_type || 'Documento'}: ${request.document_number || 'N/A'}`;
    doc.text(docLine, 50, 175, { align: 'center' });

    doc.moveTo(80, 200).lineTo(doc.page.width - 80, 200).strokeColor(secondaryColor).stroke();

    const detailsY = 220;
    const col1X = 70;
    const col2X = doc.page.width / 2 + 10;
    const lineH = 22;

    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
    doc.text('Trámite:', col1X, detailsY);
    doc.text('Radicado:', col2X, detailsY);

    doc.font('Helvetica').fillColor(darkColor);
    doc.text(request.procedure_name, col1X, detailsY + 14);
    doc.text(request.tracking_number, col2X, detailsY + 14);

    doc.font('Helvetica-Bold').fillColor(primaryColor);
    doc.text('Estado:', col1X, detailsY + lineH + 8);
    doc.text('Fecha de radicación:', col2X, detailsY + lineH + 8);

    const statusLabels = {
      aprobado: 'APROBADO', finalizado: 'FINALIZADO',
      pendiente: 'Pendiente', en_revision: 'En Revisión',
      devuelto: 'Devuelto', rechazado: 'Rechazado',
    };

    doc.font('Helvetica').fillColor(request.status === 'aprobado' || request.status === 'finalizado' ? '#2e7d32' : darkColor);
    doc.text(statusLabels[request.status] || request.status, col1X, detailsY + lineH + 22);
    doc.fillColor(darkColor);
    doc.text(new Date(request.submitted_at).toLocaleDateString('es-CO'), col2X, detailsY + lineH + 22);

    if (request.resolved_at) {
      doc.font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('Fecha de resolución:', col1X, detailsY + (lineH + 8) * 2 + 8);
      doc.font('Helvetica').fillColor(darkColor);
      doc.text(new Date(request.resolved_at).toLocaleDateString('es-CO'), col1X + 110, detailsY + (lineH + 8) * 2 + 8);
    }

    if (request.assigned_name) {
      doc.font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('Funcionario:', col2X, detailsY + (lineH + 8) * 2 + 8);
      doc.font('Helvetica').fillColor(darkColor);
      doc.text(request.assigned_name, col2X + 110, detailsY + (lineH + 8) * 2 + 8);
    }

    doc.moveTo(50, detailsY + (lineH + 8) * 3 + 30).lineTo(doc.page.width - 50, detailsY + (lineH + 8) * 3 + 30).strokeColor('#e0e4e8').stroke();

    const qrY = detailsY + (lineH + 8) * 3 + 50;
    doc.image(qrBuffer, doc.page.width / 2 - 50, qrY, { width: 100, height: 100 });

    doc.fontSize(7).font('Helvetica').fillColor('#9aa3ae');
    doc.text('Escanee el código QR para validar la autenticidad de este documento', 50, qrY + 110, { align: 'center' });
    doc.text(`Emitido el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, qrY + 125, { align: 'center' });

    doc.rect(0, doc.page.height - 25, doc.page.width, 25).fill(darkColor);
    doc.fontSize(7).fillColor('#ffffff');
    doc.text('OCCRE San Andrés Islas — occre@sanandres.gov.co', 0, doc.page.height - 18, { align: 'center', width: doc.page.width });

    doc.end();

    stream.on('finish', () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('[Certificate] Download error:', err);
        }
        fs.unlink(filepath, () => {});
      });
    });
  } catch (err) {
    console.error('[Certificate] Error:', err);
    res.status(500).json({ error: 'Error al generar constancia' });
  }
};

exports.validateQR = async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ error: 'Datos QR son requeridos' });
  }

  try {
    const parsed = JSON.parse(qrData);

    if (parsed.type !== 'occre_certificate') {
      return res.status(400).json({ error: 'QR inválido o no corresponde a OCCRE' });
    }

    const [requests] = await pool.execute(
      `SELECT r.tracking_number, r.status, r.submitted_at, r.resolved_at,
              pt.name as procedure_name,
              CONCAT(u.first_name, ' ', u.last_name) as citizen_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       WHERE r.tracking_number = ?`,
      [parsed.tracking]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada', valid: false });
    }

    const reqData = requests[0];

    res.json({
      valid: true,
      certificate: {
        trackingNumber: reqData.tracking_number,
        status: reqData.status,
        procedureName: reqData.procedure_name,
        citizenName: reqData.citizen_name,
        submittedAt: reqData.submitted_at,
        resolvedAt: reqData.resolved_at,
      },
    });
  } catch {
    res.status(400).json({ error: 'Formato QR inválido', valid: false });
  }
};
