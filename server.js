const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'co2_emissions',
  password: process.env.DB_PASSWORD || 'tu_password',
  port: process.env.DB_PORT || 5432,
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error conectando a la base de datos:', err.stack);
  }
  console.log('✅ Conectado a PostgreSQL');
  release();
});

// Rutas de la API

// Obtener todos los datos
app.get('/api/emissions', async (req, res) => {
  try {
    const { year, country, limit } = req.query;
    let query = 'SELECT * FROM emissions_data WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (year) {
      paramCount++;
      query += ` AND year = $${paramCount}`;
      params.push(year);
    }

    if (country) {
      paramCount++;
      query += ` AND entity = $${paramCount}`;
      params.push(country);
    }

    query += ' ORDER BY year, entity';

    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/emissions:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener datos agregados por año
app.get('/api/global-trends', async (req, res) => {
  try {
    const query = `
      SELECT year, SUM(emissions) as total_emissions 
      FROM emissions_data 
      WHERE year >= 1990 
      GROUP BY year 
      ORDER BY year
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/global-trends:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener top países por año
app.get('/api/top-countries', async (req, res) => {
  try {
    const { year = 2023, limit = 10 } = req.query;
    const query = `
      SELECT entity, code, emissions 
      FROM emissions_data 
      WHERE year = $1 
      ORDER BY emissions DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [year, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/top-countries:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener datos específicos de un país
app.get('/api/country/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const query = `
      SELECT year, emissions 
      FROM emissions_data 
      WHERE entity = $1 AND year >= 1990 
      ORDER BY year
    `;
    const result = await pool.query(query, [name]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/country:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener años disponibles
app.get('/api/years', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT year FROM emissions_data ORDER BY year DESC';
    const result = await pool.query(query);
    res.json(result.rows.map(row => row.year));
  } catch (err) {
    console.error('Error en /api/years:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener países disponibles
app.get('/api/countries', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT entity FROM emissions_data ORDER BY entity';
    const result = await pool.query(query);
    res.json(result.rows.map(row => row.entity));
  } catch (err) {
    console.error('Error en /api/countries:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});