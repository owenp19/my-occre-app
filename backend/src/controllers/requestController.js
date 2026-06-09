const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function generateTrackingNumber() {
  const prefix = 'OCC';
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = uuidv4().substring(0, 6).toUpperCase();
  return `${prefix}${datePart}${randomPart}`;
}

async function create(req, res) {
  const { procedureTypeId, notes } = req.body;

  if (!procedureTypeId) {
    return res.status(400).json({ error: 'El tipo de trámite es obligatorio' });
  }

  try {
    const trackingNumber = generateTrackingNumber();

    const [result] = await pool.execute(
      `INSERT INTO requests (tracking_number, user_id, procedure_type_id, status, notes)
       VALUES (?, ?, ?, 'pendiente', ?)`,
      [trackingNumber, req.user.id, procedureTypeId, notes || '']
    );

    await pool.execute(
      `INSERT INTO request_history (request_id, user_id, to_status, action, comment)
       VALUES (?, ?, 'pendiente', 'created', 'Solicitud creada')`,
      [result.insertId, req.user.id]
    );

    await pool.execute(
      `INSERT INTO notifications (user_id, title, description, type)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, 'Solicitud radicada', `Tu solicitud ha sido radicada con el número ${trackingNumber}`, 'success']
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'create_request', 'request', result.insertId, JSON.stringify({ trackingNumber, procedureTypeId }), req.ip]
    );

    res.status(201).json({
      message: 'Solicitud radicada exitosamente',
      requestId: result.insertId,
      trackingNumber,
    });
  } catch (err) {
    console.error('Error al crear solicitud:', err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
}

async function getMyRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.priority, r.notes, r.submitted_at, r.resolved_at,
              pt.name AS procedure_name, pt.slug AS procedure_slug
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       WHERE r.user_id = ?
       ORDER BY r.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) AS total FROM requests WHERE user_id = ?',
      [req.user.id]
    );
    const total = countResult[0].total;

    res.json({
      requests: rows.map(r => ({
        id: r.id,
        trackingNumber: r.tracking_number,
        status: r.status,
        priority: r.priority,
        procedureName: r.procedure_name,
        procedureSlug: r.procedure_slug,
        notes: r.notes,
        submittedAt: r.submitted_at,
        resolvedAt: r.resolved_at,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error al obtener solicitudes:', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
}

async function getByTrackingNumber(req, res) {
  const { trackingNumber } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT r.*, pt.name AS procedure_name, pt.slug AS procedure_slug, pt.description AS procedure_description,
              CONCAT(assigned.first_name, ' ', assigned.last_name) AS assigned_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       LEFT JOIN users assigned ON r.assigned_to = assigned.id
       WHERE r.tracking_number = ?`,
      [trackingNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const request = rows[0];

    if (request.user_id !== req.user.id && !req.userData.roles.includes('admin') && !req.userData.roles.includes('funcionario')) {
      return res.status(403).json({ error: 'No tienes acceso a esta solicitud' });
    }

    const [history] = await pool.execute(
      `SELECT rh.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
       FROM request_history rh
       LEFT JOIN users u ON rh.user_id = u.id
       WHERE rh.request_id = ?
       ORDER BY rh.created_at ASC`,
      [request.id]
    );

    const [documents] = await pool.execute(
      `SELECT rd.id, rd.original_name, rd.mime_type, rd.file_size, rd.document_type, rd.is_validated, rd.created_at
       FROM request_documents rd
       WHERE rd.request_id = ?`,
      [request.id]
    );

    res.json({
      request: {
        id: request.id,
        trackingNumber: request.tracking_number,
        status: request.status,
        priority: request.priority,
        procedureName: request.procedure_name,
        procedureSlug: request.procedure_slug,
        procedureDescription: request.procedure_description,
        notes: request.notes,
        internalNotes: (req.userData.roles.includes('admin') || req.userData.roles.includes('funcionario')) ? request.internal_notes : undefined,
        assignedTo: request.assigned_name,
        submittedAt: request.submitted_at,
        resolvedAt: request.resolved_at,
        updatedAt: request.updated_at,
        history: history.map(h => ({
          id: h.id,
          fromStatus: h.from_status,
          toStatus: h.to_status,
          action: h.action,
          comment: h.comment,
          userName: h.user_name,
          createdAt: h.created_at,
        })),
        documents: documents.map(d => ({
          id: d.id,
          name: d.original_name,
          mimeType: d.mime_type,
          size: d.file_size,
          documentType: d.document_type,
          isValidated: Boolean(d.is_validated),
          createdAt: d.created_at,
        })),
      },
    });
  } catch (err) {
    console.error('Error al obtener solicitud:', err);
    res.status(500).json({ error: 'Error al obtener la solicitud' });
  }
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, comment, internalNotes } = req.body;

  const validStatuses = ['borrador', 'pendiente', 'en_revision', 'devuelto', 'aprobado', 'rechazado', 'finalizado'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Estado inválido. Valores: ${validStatuses.join(', ')}` });
  }

  try {
    const [rows] = await pool.execute('SELECT id, status, user_id, tracking_number FROM requests WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const request = rows[0];
    const fromStatus = request.status;

    await pool.execute('UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    if (internalNotes && (req.userData.roles.includes('admin') || req.userData.roles.includes('funcionario'))) {
      await pool.execute(`UPDATE requests SET internal_notes = CONCAT(COALESCE(internal_notes, ''), ?) WHERE id = ?`,
        [`\n[${new Date().toISOString()}] ${req.userData.first_name} ${req.userData.last_name}: ${internalNotes}`, id]);
    }

    await pool.execute(
      `INSERT INTO request_history (request_id, user_id, from_status, to_status, action, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, fromStatus, status, `status_change_to_${status}`, comment || '']
    );

    const statusMessages = {
      en_revision: 'Tu solicitud está en revisión',
      devuelto: 'Tu solicitud ha sido devuelta para corrección',
      aprobado: 'Tu solicitud ha sido aprobada',
      rechazado: 'Tu solicitud ha sido rechazada',
      finalizado: 'Tu solicitud ha sido finalizada',
    };

    if (statusMessages[status]) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, description, type)
         VALUES (?, ?, ?, ?)`,
        [request.user_id, 'Estado de solicitud actualizado',
         `${statusMessages[status]} (${request.tracking_number})`,
         status === 'aprobado' || status === 'finalizado' ? 'success' : status === 'rechazado' || status === 'devuelto' ? 'alert' : 'info']
      );
    }

    if (status === 'rechazado' || status === 'finalizado') {
      await pool.execute('UPDATE requests SET resolved_at = NOW() WHERE id = ?', [id]);
    }

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'update_request_status', 'request', id, JSON.stringify({ from: fromStatus, to: status, comment }), req.ip]
    );

    res.json({ message: 'Estado actualizado exitosamente', fromStatus, toStatus: status });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
}

async function assignRequest(req, res) {
  const { id } = req.params;
  const { assignedTo } = req.body;

  try {
    await pool.execute('UPDATE requests SET assigned_to = ?, updated_at = NOW() WHERE id = ?', [assignedTo, id]);

    if (assignedTo) {
      const [userRow] = await pool.execute('SELECT first_name, last_name FROM users WHERE id = ?', [assignedTo]);
      if (userRow.length > 0) {
        await pool.execute(
          `INSERT INTO notifications (user_id, title, description, type)
           VALUES (?, ?, ?, ?)`,
          [assignedTo, 'Solicitud asignada', 'Se te ha asignado una nueva solicitud para revisión', 'info']
        );
      }
    }

    await pool.execute(
      `INSERT INTO request_history (request_id, user_id, action, comment)
       VALUES (?, ?, 'assigned', ?)`,
      [id, req.user.id, assignedTo ? `Asignada a usuario ${assignedTo}` : 'Desasignada']
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'assign_request', 'request', id, JSON.stringify({ assignedTo }), req.ip]
    );

    res.json({ message: 'Solicitud asignada exitosamente' });
  } catch (err) {
    console.error('Error al asignar solicitud:', err);
    res.status(500).json({ error: 'Error al asignar la solicitud' });
  }
}

async function getAllRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, priority, assignedTo, procedureTypeId, search, dateFrom, dateTo } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      const statuses = status.split(',');
      whereClause += ` AND r.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }
    if (priority) {
      whereClause += ' AND r.priority = ?';
      params.push(priority);
    }
    if (assignedTo) {
      whereClause += ' AND r.assigned_to = ?';
      params.push(assignedTo);
    }
    if (procedureTypeId) {
      whereClause += ' AND r.procedure_type_id = ?';
      params.push(procedureTypeId);
    }
    if (search) {
      whereClause += ' AND (r.tracking_number LIKE ? OR CONCAT(u.first_name, " ", u.last_name) LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (dateFrom) {
      whereClause += ' AND r.submitted_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND r.submitted_at <= ?';
      params.push(dateTo);
    }

    const [rows] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.priority, r.submitted_at, r.resolved_at,
              pt.name AS procedure_name,
              CONCAT(u.first_name, ' ', u.last_name) AS citizen_name, u.email AS citizen_email,
              CONCAT(assigned.first_name, ' ', assigned.last_name) AS assigned_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users assigned ON r.assigned_to = assigned.id
       ${whereClause}
       ORDER BY
         CASE r.priority
           WHEN 'urgente' THEN 0
           WHEN 'alta' THEN 1
           WHEN 'normal' THEN 2
           WHEN 'baja' THEN 3
           ELSE 4
         END,
         r.submitted_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total FROM requests r
       JOIN users u ON r.user_id = u.id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [statusCounts] = await pool.execute(
      `SELECT status, COUNT(*) AS count FROM requests GROUP BY status`
    );

    res.json({
      requests: rows.map(r => ({
        id: r.id,
        trackingNumber: r.tracking_number,
        status: r.status,
        priority: r.priority,
        procedureName: r.procedure_name,
        citizenName: r.citizen_name,
        citizenEmail: r.citizen_email,
        assignedName: r.assigned_name,
        submittedAt: r.submitted_at,
        resolvedAt: r.resolved_at,
      })),
      statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {}),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error al listar solicitudes:', err);
    res.status(500).json({ error: 'Error al listar solicitudes' });
  }
}

async function getMyAssignedRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let whereClause = 'WHERE r.assigned_to = ?';
    const params = [req.user.id];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.priority, r.submitted_at,
              pt.name AS procedure_name,
              CONCAT(u.first_name, ' ', u.last_name) AS citizen_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY
         CASE r.priority
           WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1 WHEN 'normal' THEN 2 ELSE 3
         END,
         r.submitted_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total FROM requests r ${whereClause}`,
      params
    );

    res.json({
      requests: rows.map(r => ({
        id: r.id,
        trackingNumber: r.tracking_number,
        status: r.status,
        priority: r.priority,
        procedureName: r.procedure_name,
        citizenName: r.citizen_name,
        submittedAt: r.submitted_at,
      })),
      pagination: { page, limit, total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / limit) },
    });
  } catch (err) {
    console.error('Error al obtener solicitudes asignadas:', err);
    res.status(500).json({ error: 'Error al obtener solicitudes asignadas' });
  }
}

async function searchRecord(req, res) {
  const { record_number, document_type, document_number } = req.body;

  if (!record_number || !document_number) {
    return res.status(400).json({ error: 'El número de radicado y el número de documento son obligatorios' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.priority, r.notes as observations, r.submitted_at, r.updated_at, r.resolved_at,
              pt.name AS procedure_name, pt.slug AS procedure_slug, pt.description AS procedure_description,
              CONCAT(u.first_name, ' ', u.last_name) AS applicant_name,
              u.document_type, u.document_number,
              o.name AS office_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN offices o ON r.office_id = o.id
       WHERE r.tracking_number = ?`,
      [record_number]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No encontramos un trámite con esos datos. Verifica el número de radicado y documento.' });
    }

    const request = rows[0];

    if (request.document_number !== document_number) {
      return res.status(404).json({ error: 'No encontramos un trámite con esos datos. Verifica el número de radicado y documento.' });
    }

    if (document_type && request.document_type !== document_type) {
      return res.status(404).json({ error: 'No encontramos un trámite con esos datos. Verifica el número de radicado y documento.' });
    }

    const [history] = await pool.execute(
      `SELECT rh.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
       FROM request_history rh
       LEFT JOIN users u ON rh.user_id = u.id
       WHERE rh.request_id = ?
       ORDER BY rh.created_at ASC`,
      [request.id]
    );

    const [documents] = await pool.execute(
      `SELECT rd.id, rd.original_name, rd.mime_type, rd.file_size, rd.document_type, rd.is_validated,
              rd.created_at AS uploaded_at, rd.document_type AS requirement_name
       FROM request_documents rd
       WHERE rd.request_id = ?`,
      [request.id]
    );

    const [appointments] = await pool.execute(
      `SELECT a.id, a.scheduled_date, a.scheduled_time, a.status, o.name AS office
       FROM appointments a
       LEFT JOIN offices o ON a.office_id = o.id
       WHERE a.procedure_type_id = ? AND a.user_id = ?`,
      [request.procedure_type_id, request.id] // note: we don't have user_id from request directly here, need to fix
    );

    const statusLabels = {
      borrador: 'Borrador',
      pendiente: 'Radicado',
      en_revision: 'En revisión',
      devuelto: 'Observado',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      finalizado: 'Finalizado',
    };

    const nextSteps = {
      borrador: 'Completa el formulario y radica tu solicitud.',
      pendiente: 'Tu solicitud está en espera de revisión inicial.',
      en_revision: 'Tu solicitud está siendo evaluada por nuestros funcionarios.',
      devuelto: 'Revisa las observaciones y corrige los documentos requeridos.',
      aprobado: 'Tu trámite ha sido aprobado. Acércate a la oficina para finalizar.',
      rechazado: 'Comunícate con la OCCRE para más información sobre el rechazo.',
      finalizado: 'Tu trámite ha sido completado exitosamente.',
    };

    const status = request.status;

    res.json({
      success: true,
      data: {
        id: request.id,
        record_number: request.tracking_number,
        procedure_name: request.procedure_name,
        procedure_slug: request.procedure_slug,
        applicant_name: request.applicant_name,
        document_type: request.document_type,
        document_number: request.document_number,
        status: status,
        status_label: statusLabels[status] || status,
        submitted_at: request.submitted_at,
        updated_at: request.updated_at,
        office: request.office_name || 'No asignada',
        next_step: nextSteps[status] || 'Espera actualizaciones.',
        observations: request.observations || '',
        appointment: appointments.length > 0 ? {
          date: appointments[0].scheduled_date,
          time: appointments[0].scheduled_time,
          office: appointments[0].office,
        } : null,
        timeline: history.map(h => ({
          status: h.to_status || h.action,
          description: h.comment || '',
          created_at: h.created_at,
          user_name: h.user_name,
        })),
        documents: documents.map(d => ({
          name: d.requirement_name || d.original_name,
          status: d.is_validated ? 'Recibido' : 'Pendiente',
          observation: null,
          uploaded_at: d.uploaded_at,
          id: d.id,
          can_download: d.is_validated,
        })),
      },
    });
  } catch (err) {
    console.error('Error al buscar radicado:', err);
    res.status(500).json({ error: 'Error al consultar el radicado' });
  }
}

async function getMyProcedures(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.tracking_number, r.status, r.priority, r.notes, r.submitted_at, r.updated_at, r.resolved_at,
              pt.name AS procedure_name, pt.slug AS procedure_slug,
              o.name AS office_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       LEFT JOIN offices o ON r.office_id = o.id
       WHERE r.user_id = ?
       ORDER BY r.submitted_at DESC`,
      [req.user.id]
    );

    const statusLabels = {
      borrador: 'Borrador',
      pendiente: 'Radicado',
      en_revision: 'En revisión',
      devuelto: 'Observado',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      finalizado: 'Finalizado',
    };

    const nextSteps = {
      borrador: 'Completa el formulario y radica tu solicitud.',
      pendiente: 'Tu solicitud está en espera de revisión inicial.',
      en_revision: 'Tu solicitud está siendo evaluada.',
      devuelto: 'Revisa las observaciones y corrige los documentos.',
      aprobado: 'Acércate a la oficina para finalizar.',
      rechazado: 'Comunícate con la OCCRE para más información.',
      finalizado: 'Trámite completado exitosamente.',
    };

    const summary = {
      total: rows.length,
      in_review: rows.filter(r => r.status === 'en_revision').length,
      approved: rows.filter(r => r.status === 'aprobado' || r.status === 'finalizado').length,
      pending: rows.filter(r => r.status === 'pendiente' || r.status === 'borrador').length,
      observed: rows.filter(r => r.status === 'devuelto').length,
    };

    res.json({
      success: true,
      data: rows.map(r => ({
        id: r.id,
        record_number: r.tracking_number,
        procedure_name: r.procedure_name,
        procedure_slug: r.procedure_slug,
        status: r.status,
        status_label: statusLabels[r.status] || r.status,
        submitted_at: r.submitted_at,
        updated_at: r.updated_at,
        office: r.office_name || 'No asignada',
        next_step: nextSteps[r.status] || 'Espera actualizaciones.',
        icon: 'document-text-outline',
      })),
      summary,
    });
  } catch (err) {
    console.error('Error al obtener mis trámites:', err);
    res.status(500).json({ error: 'Error al obtener tus trámites' });
  }
}

async function getProcedureDetail(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT r.*, pt.name AS procedure_name, pt.slug AS procedure_slug, pt.description AS procedure_description,
              CONCAT(u.first_name, ' ', u.last_name) AS applicant_name,
              u.document_type, u.document_number, u.email, u.phone,
              CONCAT(assigned.first_name, ' ', assigned.last_name) AS assigned_name,
              o.name AS office_name
       FROM requests r
       JOIN procedure_types pt ON r.procedure_type_id = pt.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users assigned ON r.assigned_to = assigned.id
       LEFT JOIN offices o ON r.office_id = o.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    const request = rows[0];

    if (request.user_id !== req.user.id && !req.userData.roles.includes('admin') && !req.userData.roles.includes('funcionario')) {
      return res.status(403).json({ error: 'No tienes acceso a este trámite' });
    }

    const [history] = await pool.execute(
      `SELECT rh.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name
       FROM request_history rh
       LEFT JOIN users u ON rh.user_id = u.id
       WHERE rh.request_id = ?
       ORDER BY rh.created_at ASC`,
      [request.id]
    );

    const [documents] = await pool.execute(
      `SELECT rd.id, rd.original_name, rd.mime_type, rd.file_size, rd.document_type, rd.is_validated, rd.created_at
       FROM request_documents rd
       WHERE rd.request_id = ?`,
      [request.id]
    );

    const [appointments] = await pool.execute(
      `SELECT a.id, a.scheduled_date, a.scheduled_time, a.status, a.appointment_code,
              o.name AS office
       FROM appointments a
       LEFT JOIN offices o ON a.office_id = o.id
       WHERE a.user_id = ? AND a.procedure_type_id = ?
       ORDER BY a.scheduled_date DESC`,
      [request.user_id, request.procedure_type_id]
    );

    const statusLabels = {
      borrador: 'Borrador',
      pendiente: 'Radicado',
      en_revision: 'En revisión',
      devuelto: 'Observado',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      finalizado: 'Finalizado',
    };

    const status = request.status;

    res.json({
      success: true,
      data: {
        id: request.id,
        record_number: request.tracking_number,
        procedure_name: request.procedure_name,
        procedure_slug: request.procedure_slug,
        procedure_description: request.procedure_description,
        applicant_name: request.applicant_name,
        document_type: request.document_type,
        document_number: request.document_number,
        email: request.email,
        phone: request.phone,
        status: status,
        status_label: statusLabels[status] || status,
        submitted_at: request.submitted_at,
        updated_at: request.updated_at,
        resolved_at: request.resolved_at,
        office: request.office_name || 'No asignada',
        assigned_to: request.assigned_name,
        observations: request.notes || '',
        actions: {
          can_upload_corrections: status === 'devuelto',
          can_schedule_appointment: true,
          can_download_receipt: status === 'aprobado' || status === 'finalizado',
          can_cancel: status === 'pendiente' || status === 'borrador',
        },
        timeline: history.map(h => ({
          id: h.id,
          status: h.to_status || h.action,
          description: h.comment || '',
          created_at: h.created_at,
          user_name: h.user_name,
        })),
        documents: documents.map(d => ({
          id: d.id,
          name: d.original_name,
          mime_type: d.mime_type,
          size: d.file_size,
          document_type: d.document_type,
          is_validated: Boolean(d.is_validated),
          uploaded_at: d.created_at,
        })),
        appointments: appointments.map(a => ({
          id: a.id,
          code: a.appointment_code,
          date: a.scheduled_date,
          time: a.scheduled_time,
          status: a.status,
          office: a.office,
        })),
      },
    });
  } catch (err) {
    console.error('Error al obtener detalle del trámite:', err);
    res.status(500).json({ error: 'Error al obtener el detalle del trámite' });
  }
}

module.exports = { create, getMyRequests, getByTrackingNumber, updateStatus, assignRequest, getAllRequests, getMyAssignedRequests, searchRecord, getMyProcedures, getProcedureDetail };
