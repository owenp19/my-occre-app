const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const APPOINTMENTS_DIR = path.join(UPLOAD_DIR, 'appointments');

if (!fs.existsSync(APPOINTMENTS_DIR)) {
  fs.mkdirSync(APPOINTMENTS_DIR, { recursive: true });
}

const DAY_MAP = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OC-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getServices(_req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, slug, description, icon, requires_documents, duration_minutes FROM appointment_services WHERE is_active = 1 ORDER BY id'
    );
    res.json({ services: rows });
  } catch (err) {
    console.error('Error al obtener servicios:', err);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
}

async function getOffices(_req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, address, phone FROM offices WHERE is_active = 1 ORDER BY id'
    );
    res.json({ offices: rows });
  } catch (err) {
    console.error('Error al obtener oficinas:', err);
    res.status(500).json({ error: 'Error al obtener oficinas' });
  }
}

async function getAvailability(req, res) {
  try {
    const { office_id, service_id, date } = req.query;
    if (!office_id || !date) {
      return res.status(400).json({ error: 'office_id y date son obligatorios' });
    }

    const [offices] = await pool.execute(
      'SELECT hours_config FROM offices WHERE id = ? AND is_active = 1',
      [office_id]
    );
    if (offices.length === 0) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    const hoursConfig = typeof offices[0].hours_config === 'string'
      ? JSON.parse(offices[0].hours_config)
      : offices[0].hours_config;

    const dateObj = new Date(date + 'T12:00:00Z');
    const dayName = DAY_MAP[dateObj.getUTCDay()];
    const baseHours = hoursConfig[dayName] || [];

    if (baseHours.length === 0) {
      return res.json({ date, available_hours: [] });
    }

    const MAX_SLOTS = 10;

    const [booked] = await pool.execute(
      `SELECT scheduled_time, COUNT(*) AS count FROM appointments
       WHERE office_id = ? AND scheduled_date = ? AND status NOT IN ('cancelada')
       AND scheduled_time IN (${baseHours.map(h => '?').join(',')})
       GROUP BY scheduled_time`,
      [office_id, date, ...baseHours]
    );
    const bookedMap = new Map(booked.map(b => [b.scheduled_time.substring(0, 5), b.count]));

    const baseMinutes = service_id
      ? (await pool.execute('SELECT duration_minutes FROM appointment_services WHERE id = ?', [service_id]))[0][0]?.duration_minutes || 15
      : 15;

    const available = baseHours
      .filter(h => (bookedMap.get(h) || 0) < MAX_SLOTS)
      .map(h => ({
        time: h,
        label: formatTime12h(h),
        available_count: MAX_SLOTS - (bookedMap.get(h) || 0),
      }));

    res.json({ date, duration_minutes: baseMinutes, available_hours: available });
  } catch (err) {
    console.error('Error al obtener disponibilidad:', err);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
}

function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

async function create(req, res) {
  try {
    const {
      service_id, office_id, scheduled_date, scheduled_time,
      citizen_full_name, citizen_document_type, citizen_document_number,
      citizen_email, citizen_phone, notes,
    } = req.body;

    if (!scheduled_date || !scheduled_time || !citizen_full_name || !citizen_email) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [existing] = await pool.execute(
      `SELECT COUNT(*) AS count FROM appointments
       WHERE office_id = ? AND scheduled_date = ? AND scheduled_time = ? AND status NOT IN ('cancelada')`,
      [office_id || null, scheduled_date, scheduled_time]
    );
    if (existing[0].count >= 10) {
      return res.status(409).json({ error: 'La fecha y hora seleccionadas no están disponibles' });
    }

    let appointmentCode = generateCode();
    let codeUnique = false;
    while (!codeUnique) {
      const [dup] = await pool.execute('SELECT id FROM appointments WHERE appointment_code = ?', [appointmentCode]);
      if (dup.length === 0) codeUnique = true;
      else appointmentCode = generateCode();
    }

    const [result] = await pool.execute(
      `INSERT INTO appointments
       (user_id, procedure_type_id, office_id, appointment_code,
        citizen_full_name, citizen_document_type, citizen_document_number,
        citizen_email, citizen_phone, scheduled_date, scheduled_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, service_id || null, office_id || null, appointmentCode,
        citizen_full_name, citizen_document_type || null, citizen_document_number || null,
        citizen_email, citizen_phone || null, scheduled_date, scheduled_time, notes || '', 'pendiente',
      ]
    );

    if (req.files && req.files.length > 0) {
      const appointmentId = result.insertId;
      for (const file of req.files) {
        const ext = path.extname(file.originalname);
        const storedName = `${uuidv4()}${ext}`;
        const destPath = path.join(APPOINTMENTS_DIR, storedName);
        fs.copyFileSync(file.path, destPath);

        const docType = file.fieldname === 'documents'
          ? (file.originalname.match(/identity|photo|support|additional/i)?.[0]?.toLowerCase() || 'support')
          : 'support';

        await pool.execute(
          `INSERT INTO appointment_documents (appointment_id, original_name, stored_name, mime_type, file_size, file_path, document_type)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [appointmentId, file.originalname, storedName, file.mimetype, file.size, destPath, docType]
        );

        try { fs.unlinkSync(file.path); } catch { /* temp cleanup */ }
      }
    }

    await pool.execute(
      `INSERT INTO notifications (user_id, title, description, type)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, 'Cita agendada',
       `Tu cita ha sido agendada para el ${scheduled_date} a las ${scheduled_time}. Código: ${appointmentCode}`,
       'success']
    );

    res.status(201).json({
      success: true,
      message: 'Cita agendada exitosamente',
      data: {
        id: result.insertId,
        code: appointmentCode,
        scheduled_date,
        scheduled_time,
      },
    });
  } catch (err) {
    console.error('Error al crear cita:', err);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
}

async function getAppointmentByCode(req, res) {
  try {
    const { code } = req.params;
    const [rows] = await pool.execute(
      `SELECT a.*, o.name AS office_name, o.address AS office_address,
              s.name AS service_name, s.slug AS service_slug, s.icon AS service_icon
       FROM appointments a
       LEFT JOIN offices o ON a.office_id = o.id
       LEFT JOIN appointment_services s ON a.procedure_type_id = s.id
       WHERE a.appointment_code = ?`,
      [code]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const [documents] = await pool.execute(
      `SELECT id, original_name, mime_type, file_size, document_type, created_at
       FROM appointment_documents WHERE appointment_id = ?`,
      [rows[0].id]
    );

    const a = rows[0];
    res.json({
      appointment: {
        id: a.id,
        code: a.appointment_code,
        serviceName: a.service_name,
        serviceSlug: a.service_slug,
        serviceIcon: a.service_icon,
        officeName: a.office_name,
        officeAddress: a.office_address,
        citizenFullName: a.citizen_full_name,
        citizenDocumentType: a.citizen_document_type,
        citizenDocumentNumber: a.citizen_document_number,
        citizenEmail: a.citizen_email,
        citizenPhone: a.citizen_phone,
        scheduledDate: a.scheduled_date,
        scheduledTime: a.scheduled_time,
        status: a.status,
        notes: a.notes,
        documents,
        createdAt: a.created_at,
      },
    });
  } catch (err) {
    console.error('Error al obtener cita por código:', err);
    res.status(500).json({ error: 'Error al obtener la cita' });
  }
}

async function getMyAppointments(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, o.name AS office_name,
              s.name AS service_name, s.icon AS service_icon
       FROM appointments a
       LEFT JOIN offices o ON a.office_id = o.id
       LEFT JOIN appointment_services s ON a.procedure_type_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`,
      [req.user.id]
    );
    res.json({
      appointments: rows.map(a => ({
        id: a.id,
        code: a.appointment_code,
        serviceName: a.service_name,
        serviceIcon: a.service_icon,
        officeName: a.office_name,
        citizenFullName: a.citizen_full_name,
        citizenDocumentType: a.citizen_document_type,
        citizenDocumentNumber: a.citizen_document_number,
        citizenEmail: a.citizen_email,
        citizenPhone: a.citizen_phone,
        scheduledDate: a.scheduled_date,
        scheduledTime: a.scheduled_time,
        status: a.status,
        notes: a.notes,
        createdAt: a.created_at,
      })),
    });
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
}

async function cancel(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT id, user_id FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    if (rows[0].user_id !== req.user.id && !req.userData.roles.includes('admin')) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar esta cita' });
    }
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', ['cancelada', id]);
    res.json({ message: 'Cita cancelada exitosamente' });
  } catch (err) {
    console.error('Error al cancelar cita:', err);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
}

async function getAllAppointments(req, res) {
  try {
    const { date, status } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (date) {
      whereClause += ' AND a.scheduled_date = ?';
      params.push(date);
    }
    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }
    const [rows] = await pool.execute(
      `SELECT a.*, o.name AS office_name,
              s.name AS service_name, s.icon AS service_icon,
              CONCAT(u.first_name, ' ', u.last_name) AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone
       FROM appointments a
       LEFT JOIN offices o ON a.office_id = o.id
       LEFT JOIN appointment_services s ON a.procedure_type_id = s.id
       JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.scheduled_date ASC, a.scheduled_time ASC`,
      params
    );
    res.json({
      appointments: rows.map(a => ({
        id: a.id,
        code: a.appointment_code,
        citizenName: a.citizen_name,
        citizenEmail: a.citizen_email,
        citizenPhone: a.citizen_phone,
        serviceName: a.service_name,
        serviceIcon: a.service_icon,
        officeName: a.office_name,
        scheduledDate: a.scheduled_date,
        scheduledTime: a.scheduled_time,
        status: a.status,
        notes: a.notes,
        createdAt: a.created_at,
      })),
    });
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
}

module.exports = {
  getServices, getOffices, getAvailability, create,
  getMyAppointments, getAppointmentByCode, cancel, getAllAppointments,
};
