const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'co2_emissions',
  password: process.env.DB_PASSWORD || 'tu_password',
  port: process.env.DB_PORT || 5432,
});

async function importData() {
  try {
    console.log('📥 Descargando datos de CO₂...');
    
    // Datos de ejemplo (puedes reemplazar con la URL real)
    const sampleData = [
      { Entity: 'United States', Code: 'USA', Year: 2020, 'Annual CO₂ emissions': 4832.45 },
      { Entity: 'China', Code: 'CHN', Year: 2020, 'Annual CO₂ emissions': 10668.23 },
      { Entity: 'India', Code: 'IND', Year: 2020, 'Annual CO₂ emissions': 2456.78 },
      { Entity: 'Russia', Code: 'RUS', Year: 2020, 'Annual CO₂ emissions': 1765.34 },
      { Entity: 'Japan', Code: 'JPN', Year: 2020, 'Annual CO₂ emissions': 1145.67 },
      { Entity: 'Germany', Code: 'DEU', Year: 2020, 'Annual CO₂ emissions': 677.52 },
      { Entity: 'United Kingdom', Code: 'GBR', Year: 2020, 'Annual CO₂ emissions': 345.23 },
      { Entity: 'Mexico', Code: 'MEX', Year: 2020, 'Annual CO₂ emissions': 456.89 },
      { Entity: 'Brazil', Code: 'BRA', Year: 2020, 'Annual CO₂ emissions': 467.12 },
    ];

    console.log('🗃️ Insertando datos en PostgreSQL...');
    
    // Limpiar tabla existente
    await pool.query('DELETE FROM emissions_data');
    
    // Insertar datos
    for (const item of sampleData) {
      await pool.query(
        'INSERT INTO emissions_data (entity, code, year, emissions) VALUES ($1, $2, $3, $4)',
        [item.Entity, item.Code, item.Year, item['Annual CO₂ emissions']]
      );
      console.log(`✅ Insertado: ${item.Entity} (${item.Year})`);
    }
    
    console.log('🎉 Todos los datos importados exitosamente!');
    
    // Verificar datos insertados
    const result = await pool.query('SELECT COUNT(*) as count FROM emissions_data');
    console.log(`📊 Total de registros en la base de datos: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error importando datos:', error);
  } finally {
    await pool.end();
  }
}

importData();