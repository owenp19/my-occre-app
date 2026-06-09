const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const [rows] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.document_type, u.document_number, u.phone, u.photo_url,
              GROUP_CONCAT(r.name) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    req.userData = {
      ...rows[0],
      roles: rows[0].roles ? rows[0].roles.split(',') : ['ciudadano'],
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userData || !req.userData.roles) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const hasRole = roles.some(role => req.userData.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
}

module.exports = { authenticateToken, requireRole };
