const mysql = require('mysql2/promise');
async function test() {
  const pool = mysql.createPool({
    host: 'localhost', port: 3306, user: 'root', password: '',
    database: 'occre_app', waitForConnections: true, connectionLimit: 1, queueLimit: 0,
  });
  const baseHours = ['08:00', '09:00', '10:00'];
  const placeholders = baseHours.map(() => '?').join(',');
  const sql = `SELECT scheduled_time, COUNT(*) AS count FROM appointments WHERE office_id = ? AND scheduled_date = ? AND status NOT IN ('cancelada') AND scheduled_time IN (${placeholders}) GROUP BY scheduled_time`;
  console.log('SQL:', sql);
  try {
    const [booked] = await pool.execute(sql, [1, '2026-06-07', ...baseHours]);
    console.log('Result:', JSON.stringify(booked));
  } catch(e) { console.log('Error:', e.message, e.code); }
  await pool.end();
}
test().catch(e => console.error('Error:', e.message));
