const pool = require('../config/database');

async function getDashboardStats(req, res) {
  try {
    const [[requestStats]] = await pool.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN status = 'en_revision' THEN 1 ELSE 0 END) AS en_revision,
        SUM(CASE WHEN status = 'aprobado' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN status = 'rechazado' THEN 1 ELSE 0 END) AS rechazados,
        SUM(CASE WHEN status = 'devuelto' THEN 1 ELSE 0 END) AS devueltos,
        SUM(CASE WHEN status = 'finalizado' THEN 1 ELSE 0 END) AS finalizados,
        SUM(CASE WHEN status IN ('pendiente','en_revision','devuelto') THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN status IN ('aprobado','rechazado','finalizado') THEN 1 ELSE 0 END) AS resueltos
      FROM requests
    `);

    const [[userStats]] = await pool.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.name = 'ciudadano' THEN 1 ELSE 0 END) AS ciudadanos,
        SUM(CASE WHEN r.name = 'funcionario' THEN 1 ELSE 0 END) AS funcionarios
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('ciudadano', 'funcionario')
    `);

    const [recentRequests] = await pool.execute(`
      SELECT r.id, r.tracking_number, r.status, r.priority, r.submitted_at,
             pt.name AS procedure_name,
             CONCAT(u.first_name, ' ', u.last_name) AS citizen_name
      FROM requests r
      JOIN procedure_types pt ON r.procedure_type_id = pt.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.submitted_at DESC
      LIMIT 10
    `);

    const [monthlyStats] = await pool.execute(`
      SELECT
        DATE_FORMAT(submitted_at, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM requests
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
      ORDER BY month ASC
    `);

    const [topProcedures] = await pool.execute(`
      SELECT pt.name, COUNT(*) AS count
      FROM requests r
      JOIN procedure_types pt ON r.procedure_type_id = pt.id
      GROUP BY pt.name
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      requests: requestStats,
      users: userStats,
      recentRequests: recentRequests.map(r => ({
        id: r.id,
        trackingNumber: r.tracking_number,
        status: r.status,
        priority: r.priority,
        procedureName: r.procedure_name,
        citizenName: r.citizen_name,
        submittedAt: r.submitted_at,
      })),
      monthlyStats,
      topProcedures,
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
}

async function getAuditLog(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) AS total FROM audit_log');
    const total = countResult[0].total;

    res.json({
      logs: rows.map(l => ({
        id: l.id,
        userId: l.user_id,
        userName: l.user_name,
        action: l.action,
        entityType: l.entity_type,
        entityId: l.entity_id,
        details: l.details ? JSON.parse(l.details) : null,
        ipAddress: l.ip_address,
        createdAt: l.created_at,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error al obtener auditoría:', err);
    res.status(500).json({ error: 'Error al obtener registro de auditoría' });
  }
}

async function getReports(req, res) {
  try {
    const { dateFrom, dateTo, groupBy } = req.query;

    let groupField, selectField;
    if (groupBy === 'procedure') {
      groupField = 'pt.name';
      selectField = 'pt.name AS label';
    } else if (groupBy === 'status') {
      groupField = 'r.status';
      selectField = 'r.status AS label';
    } else if (groupBy === 'funcionario') {
      groupField = 'CONCAT(assigned.first_name, " ", assigned.last_name)';
      selectField = 'CONCAT(assigned.first_name, " ", assigned.last_name) AS label';
    } else {
      groupField = 'DATE(r.submitted_at)';
      selectField = 'DATE(r.submitted_at) AS label';
    }

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND r.submitted_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND r.submitted_at <= ?';
      params.push(dateTo);
    }

    const [rows] = await pool.execute(
      `SELECT ${selectField}, COUNT(*) AS count,
              SUM(CASE WHEN r.status IN ('aprobado','finalizado') THEN 1 ELSE 0 END) AS completed,
              ROUND(AVG(CASE WHEN r.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, r.submitted_at, r.resolved_at) ELSE NULL END), 1) AS avg_hours
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       LEFT JOIN users assigned ON r.assigned_to = assigned.id
       ${whereClause}
       GROUP BY ${groupField}
       ORDER BY count DESC
       LIMIT 50`,
      params
    );

    res.json({ reports: rows });
  } catch (err) {
    console.error('Error al generar reportes:', err);
    res.status(500).json({ error: 'Error al generar reportes' });
  }
}

async function exportExcel(req, res) {
  try {
    const { dateFrom, dateTo, status } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND r.submitted_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND r.submitted_at <= ?';
      params.push(dateTo);
    }
    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT r.tracking_number, r.status, r.priority, r.submitted_at, r.resolved_at,
              pt.name AS procedure_name,
              CONCAT(u.first_name, ' ', u.last_name) AS citizen_name, u.email, u.document_number,
              CONCAT(assigned.first_name, ' ', assigned.last_name) AS assigned_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users assigned ON r.assigned_to = assigned.id
       ${whereClause}
       ORDER BY r.submitted_at DESC`,
      params
    );

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte OCCRE');

    worksheet.columns = [
      { header: 'Radicado', key: 'tracking_number', width: 25 },
      { header: 'Trámite', key: 'procedure_name', width: 30 },
      { header: 'Ciudadano', key: 'citizen_name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Documento', key: 'document_number', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Prioridad', key: 'priority', width: 10 },
      { header: 'Funcionario', key: 'assigned_name', width: 25 },
      { header: 'Radicado', key: 'submitted_at', width: 20 },
      { header: 'Resuelto', key: 'resolved_at', width: 20 },
    ];

    rows.forEach(r => worksheet.addRow(r));

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_occre.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error al exportar Excel:', err);
    res.status(500).json({ error: 'Error al exportar a Excel' });
  }
}

async function exportPdf(req, res) {
  try {
    const { dateFrom, dateTo, status } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND r.submitted_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND r.submitted_at <= ?';
      params.push(dateTo);
    }
    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT r.tracking_number, r.status, r.submitted_at,
              pt.name AS procedure_name,
              CONCAT(u.first_name, ' ', u.last_name) AS citizen_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.submitted_at DESC
       LIMIT 500`,
      params
    );

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_occre.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Reporte OCCRE - San Andrés Islas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown();

    const tableTop = doc.y;
    const columns = [120, 150, 100, 100];
    const headers = ['Radicado', 'Trámite', 'Ciudadano', 'Estado'];

    doc.fontSize(8).font('Helvetica-Bold');
    let x = 30;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: columns[i] });
      x += columns[i];
    });

    doc.moveDown(0.5);
    doc.font('Helvetica');

    rows.forEach((r, idx) => {
      const y = doc.y;
      if (y > 750) {
        doc.addPage();
      }
      x = 30;
      const data = [r.tracking_number, r.procedure_name, r.citizen_name, r.status];
      data.forEach((d, i) => {
        doc.fontSize(7).text(String(d), x, doc.y, { width: columns[i] });
        x += columns[i];
      });
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    console.error('Error al exportar PDF:', err);
    res.status(500).json({ error: 'Error al exportar a PDF' });
  }
}

async function getFuncionarios(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE r.name IN ('funcionario', 'admin')
       ORDER BY u.first_name ASC`
    );

    res.json({
      funcionarios: rows.map(f => ({
        id: f.id,
        name: `${f.first_name} ${f.last_name}`,
        email: f.email,
      })),
    });
  } catch (err) {
    console.error('Error al obtener funcionarios:', err);
    res.status(500).json({ error: 'Error al obtener funcionarios' });
  }
}

module.exports = { getDashboardStats, getAuditLog, getReports, exportExcel, exportPdf, getFuncionarios };
