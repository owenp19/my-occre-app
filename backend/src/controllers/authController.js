const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

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

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: result.insertId, firstName, lastName, email },
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
      'SELECT id, first_name, last_name, email, password, phone, document_type, document_number FROM users WHERE email = ?',
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
      'SELECT id, first_name, last_name, email, document_type, document_number, phone, created_at FROM users WHERE id = ?',
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
      'SELECT id, first_name, last_name, email, document_type, document_number, phone, created_at FROM users WHERE id = ?',
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
      },
    });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

module.exports = { register, login, getProfile, updateProfile };
