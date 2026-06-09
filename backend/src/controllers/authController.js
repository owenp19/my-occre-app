const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 12;

async function register(req, res) {
  const { firstName, lastName, email, password, documentType, documentNumber, phone } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Nombre, apellido, correo y contraseña son obligatorios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password, document_type, document_number, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, documentType || null, documentNumber || null, phone || null]
    );

    const roleId = await pool.execute('SELECT id FROM roles WHERE name = ?', ['ciudadano']);
    if (roleId[0].length > 0) {
      await pool.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [result.insertId, roleId[0][0].id]
      );
    }

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [result.insertId, 'register', 'user', result.insertId, JSON.stringify({ email }), req.ip]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: result.insertId, firstName, lastName, email, phone: '', documentType: '', documentNumber: '', photoUrl: '', roles: ['ciudadano'] },
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.password, u.phone, u.document_type, u.document_number, u.photo_url,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = ?
       GROUP BY u.id`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const roles = user.roles ? user.roles.split(',') : ['ciudadano'];

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, 'login', 'user', user.id, JSON.stringify({ email }), req.ip]
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || '',
        documentType: user.document_type || '',
        documentNumber: user.document_number || '',
        photoUrl: user.photo_url || '',
        roles,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function getProfile(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.document_type, u.document_number, u.phone, u.photo_url, u.created_at,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        documentType: user.document_type,
        documentNumber: user.document_number,
        phone: user.phone || '',
        photoUrl: user.photo_url || '',
        roles: user.roles ? user.roles.split(',') : ['ciudadano'],
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
}

async function updateProfile(req, res) {
  const { firstName, lastName, documentType, documentNumber, phone } = req.body;

  try {
    await pool.execute(
      `UPDATE users
       SET first_name = ?, last_name = ?, document_type = ?, document_number = ?, phone = ?
       WHERE id = ?`,
      [firstName, lastName, documentType || null, documentNumber || null, phone || null, req.user.id]
    );

    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, document_type, document_number, phone, photo_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = rows[0];
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        documentType: user.document_type,
        documentNumber: user.document_number,
        phone: user.phone || '',
        photoUrl: user.photo_url || '',
      },
    });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

async function uploadPhoto(req, res) {
  const { photoUrl } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ error: 'La imagen es obligatoria' });
  }

  try {
    await pool.execute(
      'UPDATE users SET photo_url = ? WHERE id = ?',
      [photoUrl, req.user.id]
    );

    res.json({ message: 'Foto actualizada exitosamente', photoUrl });
  } catch (err) {
    console.error('Error al actualizar foto:', err);
    res.status(500).json({ error: 'Error al actualizar la foto' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(200).json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, rows[0].id]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8100'}/reset-password?token=${resetToken}`;

    console.log(`[Password Reset] Link para ${email}: ${resetUrl}`);

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@occre.gov.co',
        to: email,
        subject: 'Recuperación de contraseña - OCCRE',
        html: `<p>Has solicitado recuperar tu contraseña.</p>
               <p>Haz clic en el siguiente enlace para restablecerla:</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>
               <p>Este enlace expira en 1 hora.</p>
               <p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
      });
    }

    res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
  } catch (err) {
    console.error('Error en forgot password:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, rows[0].id]
    );

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (err) {
    console.error('Error en reset password:', err);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
}

async function listUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.document_type, u.document_number, u.phone, u.photo_url, u.created_at,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    const total = countResult[0].total;

    res.json({
      users: rows.map(u => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        documentType: u.document_type,
        documentNumber: u.document_number,
        phone: u.phone,
        photoUrl: u.photo_url,
        roles: u.roles ? u.roles.split(',') : ['ciudadano'],
        createdAt: u.created_at,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

async function updateUserRoles(req, res) {
  const { userId } = req.params;
  const { roles } = req.body;

  if (!roles || !Array.isArray(roles)) {
    return res.status(400).json({ error: 'Roles debe ser un array' });
  }

  try {
    await pool.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

    for (const roleName of roles) {
      const [roleRows] = await pool.execute('SELECT id FROM roles WHERE name = ?', [roleName]);
      if (roleRows.length > 0) {
        await pool.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleRows[0].id]
        );
      }
    }

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'update_roles', 'user', userId, JSON.stringify({ roles }), req.ip]
    );

    res.json({ message: 'Roles actualizados exitosamente' });
  } catch (err) {
    console.error('Error al actualizar roles:', err);
    res.status(500).json({ error: 'Error al actualizar roles' });
  }
}

async function getBiometricPreference(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT biometric_enabled FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );
    const enabled = rows.length > 0 ? rows[0].biometric_enabled === 1 : false;
    res.json({ biometricEnabled: enabled });
  } catch (err) {
    console.error('Error al obtener preferencia biométrica:', err);
    res.status(500).json({ error: 'Error al obtener preferencia' });
  }
}

async function setBiometricPreference(req, res) {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled debe ser booleano' });
  }

  try {
    await pool.execute(
      `INSERT INTO user_preferences (user_id, biometric_enabled)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE biometric_enabled = ?`,
      [req.user.id, enabled, enabled]
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'update_biometric_pref', 'user', req.user.id, JSON.stringify({ enabled }), req.ip]
    );

    res.json({ message: 'Preferencia guardada', biometricEnabled: enabled });
  } catch (err) {
    console.error('Error al guardar preferencia biométrica:', err);
    res.status(500).json({ error: 'Error al guardar preferencia' });
  }
}

module.exports = { register, login, getProfile, updateProfile, uploadPhoto, forgotPassword, resetPassword, listUsers, updateUserRoles, getBiometricPreference, setBiometricPreference };
