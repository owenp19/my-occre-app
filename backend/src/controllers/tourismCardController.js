const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function generateCode() {
  const year = new Date().getFullYear();
  let code, exists;
  let attempts = 0;
  do {
    const rand = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
    code = `OCCRE-TT-${year}-${rand}`;
    const [rows] = await pool.execute('SELECT id FROM tourist_cards WHERE code = ?', [code]);
    exists = rows.length > 0;
    attempts++;
    if (attempts > 100) throw new Error('No se pudo generar un código único después de 100 intentos');
  } while (exists);
  return code;
}

async function getTariff(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT concept, amount, currency, active FROM tourism_tariffs
       WHERE active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY id DESC LIMIT 1`
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No hay tarifa activa' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[TourismCard] getTariff error:', err);
    res.status(500).json({ error: 'Error al consultar tarifa' });
  }
}

async function quote(req, res) {
  try {
    const { birth_date, document_type, document_number, entry_date, return_date, nationality } = req.body;
    if (!birth_date || !entry_date || !return_date) {
      return res.status(400).json({ error: 'Fechas obligatorias' });
    }

    const [tariff] = await pool.execute(
      `SELECT amount, currency, concept FROM tourism_tariffs
       WHERE active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY id DESC LIMIT 1`
    );

    if (tariff.length === 0) return res.status(404).json({ error: 'No hay tarifa activa' });

    res.json({
      requires_payment: true,
      amount: tariff[0].amount,
      currency: tariff[0].currency,
      concept: tariff[0].concept,
      exemption_reason: null,
    });
  } catch (err) {
    console.error('[TourismCard] quote error:', err);
    res.status(500).json({ error: 'Error al cotizar' });
  }
}

async function createTourismCard(req, res) {
  try {
    const {
      first_name, last_name, document_type, document_number, birth_date,
      nationality, country_residence, city_residence, email, phone,
      emergency_contact_name, emergency_contact_phone,
      entry_date, return_date, transport_type, airline_or_company, flight_number,
      origin_city, travel_reason, lodging_type, lodging_name, lodging_address,
      lodging_sector, lodging_phone, lodging_responsible_name,
      accepted_terms, accepted_location_consent,
    } = req.body;

    if (!first_name || !last_name || !document_type || !document_number || !email || !phone) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    if (!entry_date || !return_date) {
      return res.status(400).json({ error: 'Fechas de viaje obligatorias' });
    }
    if (!accepted_terms) {
      return res.status(400).json({ error: 'Debe aceptar términos y condiciones' });
    }

    const [tariff] = await pool.execute(
      `SELECT amount, currency FROM tourism_tariffs
       WHERE active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY id DESC LIMIT 1`
    );
    const amount = tariff.length > 0 ? tariff[0].amount : 0;
    const currency = tariff.length > 0 ? tariff[0].currency : 'COP';

    const code = await generateCode();
    const [result] = await pool.execute(
      `INSERT INTO tourist_cards
       (code, first_name, last_name, document_type, document_number, birth_date,
        nationality, country_residence, city_residence, email, phone,
        emergency_contact_name, emergency_contact_phone,
        entry_date, return_date, transport_type, airline_or_company, flight_number,
        origin_city, travel_reason, lodging_type, lodging_name, lodging_address,
        lodging_sector, lodging_phone, lodging_responsible_name,
        amount, currency, payment_status, card_status,
        accepted_terms, accepted_location_consent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', 'Pendiente de pago', ?, ?)`,
      [code, first_name, last_name, document_type, document_number, birth_date || null,
       nationality || null, country_residence || null, city_residence || null, email, phone,
       emergency_contact_name || null, emergency_contact_phone || null,
       entry_date, return_date, transport_type || null, airline_or_company || null, flight_number || null,
       origin_city || null, travel_reason || null, lodging_type || null, lodging_name || null, lodging_address || null,
       lodging_sector || null, lodging_phone || null, lodging_responsible_name || null,
       amount, currency, accepted_terms ? 1 : 0, accepted_location_consent ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        code,
        payment_status: 'Pendiente',
        card_status: 'Pendiente de pago',
        amount,
        currency,
      },
    });
  } catch (err) {
    console.error('[TourismCard] create error:', err);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
}

async function initPayment(req, res) {
  try {
    const { code } = req.params;
    const [cards] = await pool.execute('SELECT id, amount, currency FROM tourist_cards WHERE code = ?', [code]);
    if (cards.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const card = cards[0];
    const reference = `PAY-${code}`;
    const paymentUrl = process.env.PAYMENT_GATEWAY_URL
      ? `${process.env.PAYMENT_GATEWAY_URL}/checkout?reference=${reference}&amount=${card.amount}&currency=${card.currency}`
      : null;

    if (paymentUrl) {
      // Sandbox mode — simulate
    }

    await pool.execute(
      `INSERT INTO tourist_card_payments (tourist_card_id, payment_reference, gateway, amount, currency, status)
       VALUES (?, ?, 'pasarela', ?, ?, 'Pendiente')`,
      [card.id, reference, card.amount, card.currency]
    );

    await pool.execute(
      'UPDATE tourist_cards SET payment_reference = ? WHERE id = ?',
      [reference, card.id]
    );

    res.json({
      success: true,
      payment_url: paymentUrl || `${process.env.FRONTEND_URL || 'http://localhost:8100'}/tarjeta-turismo/pago/${code}/sandbox`,
      reference,
    });
  } catch (err) {
    console.error('[TourismCard] initPayment error:', err);
    res.status(500).json({ error: 'Error al inicializar pago' });
  }
}

async function checkPaymentStatus(req, res) {
  try {
    const { code } = req.params;
    const [cards] = await pool.execute(
      `SELECT tc.code, tc.payment_status, tc.card_status, tc.amount, tc.currency,
              p.id as payment_id, p.status as payment_gateway_status, p.gateway_response
       FROM tourist_cards tc
       LEFT JOIN tourist_card_payments p ON p.tourist_card_id = tc.id
       WHERE tc.code = ? ORDER BY p.id DESC LIMIT 1`,
      [code]
    );
    if (cards.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    res.json({
      code: cards[0].code,
      payment_status: cards[0].payment_status,
      card_status: cards[0].card_status,
      amount: cards[0].amount,
      currency: cards[0].currency,
    });
  } catch (err) {
    console.error('[TourismCard] checkPayment error:', err);
    res.status(500).json({ error: 'Error al consultar pago' });
  }
}

async function searchCard(req, res) {
  try {
    const { code, document_number } = req.body;
    if (!code || !document_number) {
      return res.status(400).json({ error: 'Código y documento obligatorios' });
    }

    const [rows] = await pool.execute(
      `SELECT code, first_name, last_name, document_type, document_number,
              nationality, entry_date, return_date, lodging_name, lodging_sector,
              amount, currency, payment_status, card_status, qr_code, receipt_url,
              created_at
       FROM tourist_cards
       WHERE code = ? AND document_number = ?`,
      [code, document_number]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'No se encontró registro con esos datos' });

    res.json(rows[0]);
  } catch (err) {
    console.error('[TourismCard] search error:', err);
    res.status(500).json({ error: 'Error al buscar' });
  }
}

async function getReceipt(req, res) {
  try {
    const { code } = req.params;
    const [rows] = await pool.execute(
      `SELECT tc.*, r.receipt_number, r.pdf_path, r.qr_payload
       FROM tourist_cards tc
       LEFT JOIN tourist_card_receipts r ON r.tourist_card_id = tc.id
       WHERE tc.code = ?`,
      [code]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Recibo no encontrado' });

    const card = rows[0];
    const birthday = card.birth_date ? new Date(card.birth_date).toISOString().split('T')[0] : null;
    const entry = card.entry_date ? new Date(card.entry_date).toISOString().split('T')[0] : null;
    const ret = card.return_date ? new Date(card.return_date).toISOString().split('T')[0] : null;

    res.json({
      code: card.code,
      receipt_number: card.receipt_number || null,
      pdf_path: card.pdf_path || null,
      qr_payload: card.qr_payload || null,
      first_name: card.first_name,
      last_name: card.last_name,
      document_type: card.document_type,
      document_number: card.document_number,
      birth_date: birthday,
      nationality: card.nationality,
      country_residence: card.country_residence,
      city_residence: card.city_residence,
      email: card.email,
      phone: card.phone,
      emergency_contact_name: card.emergency_contact_name,
      emergency_contact_phone: card.emergency_contact_phone,
      entry_date: entry,
      return_date: ret,
      transport_type: card.transport_type,
      airline_or_company: card.airline_or_company,
      flight_number: card.flight_number,
      origin_city: card.origin_city,
      travel_reason: card.travel_reason,
      lodging_type: card.lodging_type,
      lodging_name: card.lodging_name,
      lodging_address: card.lodging_address,
      lodging_sector: card.lodging_sector,
      lodging_phone: card.lodging_phone,
      lodging_responsible_name: card.lodging_responsible_name,
      amount: card.amount,
      currency: card.currency,
      payment_status: card.payment_status,
      card_status: card.card_status,
      created_at: card.created_at,
    });
  } catch (err) {
    console.error('[TourismCard] getReceipt error:', err);
    res.status(500).json({ error: 'Error al obtener recibo' });
  }
}

async function verifyCard(req, res) {
  try {
    const { code } = req.params;
    const [rows] = await pool.execute(
      `SELECT code, card_status, payment_status, entry_date, return_date,
              document_type, document_number
       FROM tourist_cards WHERE code = ?`,
      [code]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Código no válido' });

    const card = rows[0];
    const docNumber = card.document_number;
    const hiddenDoc = docNumber.length > 4
      ? docNumber.slice(0, -4).replace(/./g, '*') + docNumber.slice(-4)
      : '****' + docNumber.slice(-2);

    const today = new Date();
    const returnDate = new Date(card.return_date);
    const isValid = card.payment_status === 'Pagado' && returnDate >= today;

    res.json({
      code: card.code,
      status: card.card_status,
      payment_status: card.payment_status,
      entry_date: card.entry_date,
      return_date: card.return_date,
      document: `${card.document_type} ${hiddenDoc}`,
      valid: isValid,
      message: isValid ? 'Documento válido' : 'Documento vencido o no pagado',
    });
  } catch (err) {
    console.error('[TourismCard] verify error:', err);
    res.status(500).json({ error: 'Error al validar' });
  }
}

async function verifyByQrToken(req, res) {
  try {
    const { qr_token } = req.params;
    const [rows] = await pool.execute(
      `SELECT code, card_status, payment_status, entry_date, return_date,
              document_type, document_number, first_name, last_name,
              qr_validation_url, issued_at, expires_at
       FROM tourist_cards WHERE qr_token = ?`,
      [qr_token]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Código QR no válido' });

    const card = rows[0];
    const today = new Date();
    const expiresAt = card.expires_at ? new Date(card.expires_at) : null;
    const isExpired = expiresAt && expiresAt < today;
    const isValid = card.payment_status === 'Pagado' && !isExpired;

    res.json({
      code: card.code,
      first_name: card.first_name,
      last_name: card.last_name,
      document_type: card.document_type,
      document_number: card.document_number,
      status: isExpired ? 'Vencida' : card.card_status,
      payment_status: card.payment_status,
      entry_date: card.entry_date,
      return_date: card.return_date,
      issued_at: card.issued_at,
      expires_at: card.expires_at,
      valid: isValid,
      message: isValid ? 'Documento válido' : 'Documento vencido o no pagado',
    });
  } catch (err) {
    console.error('[TourismCard] verifyByQrToken error:', err);
    res.status(500).json({ error: 'Error al validar QR' });
  }
}

async function updateCardStatusExpired() {
  try {
    const [result] = await pool.execute(
      `UPDATE tourist_cards SET card_status = 'Vencida'
       WHERE payment_status = 'Pagado' AND card_status != 'Vencida'
         AND expires_at IS NOT NULL AND expires_at < NOW()`
    );
    if (result.affectedRows > 0) {
      console.log(`[TourismCard] ${result.affectedRows} tarjeta(s) marcada(s) como vencida(s)`);
    }
  } catch (err) {
    console.error('[TourismCard] updateCardStatusExpired error:', err);
  }
}

async function shareLocation(req, res) {
  try {
    const { code } = req.params;
    const { latitude, longitude, accuracy, reason, captured_at } = req.body;

    const [cards] = await pool.execute('SELECT id FROM tourist_cards WHERE code = ?', [code]);
    if (cards.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    await pool.execute(
      `INSERT INTO tourist_location_events (tourist_card_id, latitude, longitude, accuracy, reason, captured_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cards[0].id, latitude || null, longitude || null, accuracy || null, reason || 'voluntario', captured_at || new Date()]
    );

    res.json({ success: true, message: 'Ubicación registrada' });
  } catch (err) {
    console.error('[TourismCard] shareLocation error:', err);
    res.status(500).json({ error: 'Error al guardar ubicación' });
  }
}

async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS cnt FROM tourist_card_receipts WHERE YEAR(created_at) = ?', [year]
  );
  const seq = String(Number(rows[0].cnt) + 1).padStart(6, '0');
  return `RC-${year}-${seq}`;
}

async function paymentWebhook(req, res) {
  try {
    const { reference, status, gateway_response } = req.body;
    if (!reference || !status) {
      return res.status(400).json({ error: 'Reference y status obligatorios' });
    }

    const code = reference.replace('PAY-', '');
    const [cards] = await pool.execute(
      'SELECT id, return_date, return_time, notify_email, notify_sms, notify_push, reminder_days_before FROM tourist_cards WHERE code = ?',
      [code]
    );
    if (cards.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const card = cards[0];
    const cardId = card.id;
    const isApproved = status === 'approved' || status === 'completed';
    const paymentStatus = isApproved ? 'Pagado' : 'Rechazado';
    const cardStatus = isApproved ? 'Emitida' : 'Pendiente de pago';

    await pool.execute(
      `UPDATE tourist_card_payments SET status = ?, gateway_response = ?,
       paid_at = ? WHERE payment_reference = ?`,
      [paymentStatus, gateway_response ? JSON.stringify(gateway_response) : null,
       isApproved ? new Date() : null, reference]
    );

    if (isApproved) {
      const receiptNumber = await generateReceiptNumber();
      const qrToken = uuidv4();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8100';
      const qrValidationUrl = `${frontendUrl}/validar-tarjeta-turismo/qr/${qrToken}`;
      const issuedAt = new Date();
      const returnDate = new Date(card.return_date);
      const expiresAt = new Date(returnDate);
      expiresAt.setHours(23, 59, 59, 999);

      await pool.execute(
        `UPDATE tourist_cards
         SET payment_status = 'Pagado', card_status = 'Emitida',
             receipt_number = ?, payment_reference = ?,
             qr_token = ?, qr_validation_url = ?,
             issued_at = ?, expires_at = ?
         WHERE id = ?`,
        [receiptNumber, reference, qrToken, qrValidationUrl, issuedAt, expiresAt, cardId]
      );

      await pool.execute(
        `INSERT INTO tourist_card_receipts
         (tourist_card_id, receipt_number, qr_payload, qr_token, issued_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cardId, receiptNumber, qrValidationUrl, qrToken, issuedAt, expiresAt]
      );

      // Crear recordatorios según preferencias
      const reminderDate = new Date(returnDate);
      if (card.reminder_days_before && card.reminder_days_before > 0) {
        reminderDate.setDate(reminderDate.getDate() - card.reminder_days_before);
      }
      if (card.notify_email) {
        await pool.execute(
          `INSERT INTO tourist_return_reminders (tourist_card_id, reminder_type, remind_at)
           VALUES (?, 'email', ?)`,
          [cardId, reminderDate]
        );
      }
      if (card.notify_sms) {
        await pool.execute(
          `INSERT INTO tourist_return_reminders (tourist_card_id, reminder_type, remind_at)
           VALUES (?, 'sms', ?)`,
          [cardId, reminderDate]
        );
      }
      if (card.notify_push) {
        await pool.execute(
          `INSERT INTO tourist_return_reminders (tourist_card_id, reminder_type, remind_at)
           VALUES (?, 'push', ?)`,
          [cardId, reminderDate]
        );
      }
    } else {
      await pool.execute(
        'UPDATE tourist_cards SET payment_status = ?, card_status = ? WHERE id = ?',
        [paymentStatus, cardStatus, cardId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[TourismCard] webhook error:', err);
    res.status(500).json({ error: 'Error en webhook' });
  }
}

module.exports = {
  getTariff, quote, createTourismCard, initPayment, checkPaymentStatus,
  searchCard, getReceipt, verifyCard, verifyByQrToken, updateCardStatusExpired,
  shareLocation, paymentWebhook,
};
