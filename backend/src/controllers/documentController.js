const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

async function uploadDocument(req, res) {
  const { requestId, documentType } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: 'El ID de la solicitud es obligatorio' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'El archivo es obligatorio' });
  }

  try {
    const [requestRows] = await pool.execute(
      'SELECT id, user_id FROM requests WHERE id = ?',
      [requestId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const request = requestRows[0];
    if (request.user_id !== req.user.id && !req.userData.roles.includes('admin')) {
      return res.status(403).json({ error: 'No tienes permisos para subir documentos a esta solicitud' });
    }

    const file = req.file;

    const [result] = await pool.execute(
      `INSERT INTO request_documents (request_id, user_id, original_name, stored_name, mime_type, file_size, file_path, document_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [requestId, req.user.id, file.originalname, file.filename, file.mimetype, file.size, file.path, documentType || 'general']
    );

    await pool.execute(
      `INSERT INTO request_history (request_id, user_id, action, comment)
       VALUES (?, ?, 'document_uploaded', ?)`,
      [requestId, req.user.id, `Documento subido: ${file.originalname}`]
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'upload_document', 'request_document', result.insertId, JSON.stringify({ requestId, fileName: file.originalname }), req.ip]
    );

    res.status(201).json({
      message: 'Documento subido exitosamente',
      document: {
        id: result.insertId,
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        documentType: documentType || 'general',
      },
    });
  } catch (err) {
    console.error('Error al subir documento:', err);
    res.status(500).json({ error: 'Error al subir el documento' });
  }
}

async function downloadDocument(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT rd.*, r.user_id AS request_owner_id
       FROM request_documents rd
       JOIN requests r ON rd.request_id = r.id
       WHERE rd.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const doc = rows[0];

    if (doc.request_owner_id !== req.user.id && !req.userData.roles.includes('admin') && !req.userData.roles.includes('funcionario')) {
      return res.status(403).json({ error: 'No tienes acceso a este documento' });
    }

    const filePath = path.resolve(doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    res.download(filePath, doc.original_name);
  } catch (err) {
    console.error('Error al descargar documento:', err);
    res.status(500).json({ error: 'Error al descargar el documento' });
  }
}

async function validateDocument(req, res) {
  const { id } = req.params;
  const { isValid } = req.body;

  try {
    const [rows] = await pool.execute(
      `SELECT rd.request_id FROM request_documents rd WHERE rd.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    await pool.execute(
      'UPDATE request_documents SET is_validated = ?, validated_by = ?, validated_at = NOW() WHERE id = ?',
      [isValid ? 1 : 0, req.user.id, id]
    );

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'validate_document', 'request_document', id, JSON.stringify({ isValid }), req.ip]
    );

    res.json({ message: isValid ? 'Documento validado' : 'Documento rechazado' });
  } catch (err) {
    console.error('Error al validar documento:', err);
    res.status(500).json({ error: 'Error al validar el documento' });
  }
}

async function deleteDocument(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT file_path, request_id FROM request_documents WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const doc = rows[0];

    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await pool.execute('DELETE FROM request_documents WHERE id = ?', [id]);

    await pool.execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, 'delete_document', 'request_document', id, '{}', req.ip]
    );

    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    console.error('Error al eliminar documento:', err);
    res.status(500).json({ error: 'Error al eliminar el documento' });
  }
}

module.exports = { uploadDocument, downloadDocument, validateDocument, deleteDocument };
