import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Datos geoespaciales simplificados (los mismos de arriba)
import localGeoData from './world-geo-data.json';

const WorldHeatMap = ({ emissionsData, year }) => {
  const [maxEmissions, setMaxEmissions] = useState(0);
  const [minEmissions, setMinEmissions] = useState(0);

  // Procesar datos de emisiones para el año seleccionado
  useEffect(() => {
    if (emissionsData.length > 0) {
      const emissionsValues = emissionsData
        .filter(item => item.year === year)
        .map(item => item.emissions)
        .filter(emissions => emissions > 0);
      
      if (emissionsValues.length > 0) {
        setMaxEmissions(Math.max(...emissionsValues));
        setMinEmissions(Math.min(...emissionsValues));
      }
    }
  }, [emissionsData, year]);

  // Función para obtener el color basado en las emisiones (sin d3-scale)
  const getColor = (emissions) => {
    if (!emissions || maxEmissions === minEmissions) return '#f5f5f5';
    
    // Escala de rojos manual: de claro a oscuro
    const normalized = (emissions - minEmissions) / (maxEmissions - minEmissions);
    
    // Generar color en escala roja
    const red = Math.floor(128 + normalized * 127); // 128 a 255
    const green = Math.floor(192 - normalized * 192); // 192 a 0
    const blue = Math.floor(192 - normalized * 192); // 192 a 0
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Función para estilizar cada país en el mapa
  const styleFeature = (feature) => {
    const countryName = feature.properties.name;
    const countryData = emissionsData.find(
      item => item.entity === countryName && item.year === year
    );
    
    const emissions = countryData ? countryData.emissions : null;
    
    return {
      fillColor: getColor(emissions),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: emissions ? 0.8 : 0.2
    };
  };

  // Función para mostrar tooltip al pasar el mouse
  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.name;
    const countryData = emissionsData.find(
      item => item.entity === countryName && item.year === year
    );
    
    const emissions = countryData ? countryData.emissions : null;
    
    if (emissions) {
      const tooltipContent = `
        <div style="padding: 5px;">
          <strong>${countryName}</strong><br/>
          📊 Emisiones: ${emissions.toLocaleString()} toneladas<br/>
          📅 Año: ${year}
        </div>
      `;
      
      layer.bindTooltip(tooltipContent);
    } else {
      layer.bindTooltip(`<strong>${countryName}</strong><br/>❌ Sin datos disponibles`);
    }
  };

  // Generar años disponibles
  const availableYears = [...new Set(emissionsData.map(item => item.year))].sort((a, b) => b - a);
  const currentYear = year || (availableYears.length > 0 ? Math.max(...availableYears) : 2020);

  if (!localGeoData) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Cargando mapa mundial...</p>
      </div>
    );
  }

  return (
    <div className="world-heatmap">
      <div className="map-header">
        <h2>🌍 Mapa Mundial de Emisiones de CO₂</h2>
        <p>Visualización de zonas más contaminadas por país ({currentYear})</p>
        
        
      </div>

      <div className="map-container">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON
            data={localGeoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>

      <div className="map-legend">
        <h4>🎨 Leyenda - Escala de Emisiones (toneladas de CO₂)</h4>
        <div className="legend-gradient">
          <div className="legend-labels">
            <span>Bajo: {minEmissions.toLocaleString()}</span>
            <span>Alto: {maxEmissions.toLocaleString()}</span>
          </div>
          <div 
            className="gradient-bar"
            style={{
              background: 'linear-gradient(to right, #ffcccc, #8b0000)',
              height: '20px',
              borderRadius: '4px',
              margin: '5px 0'
            }}
          ></div>
          <div className="legend-description">
            <span>Menos contaminado</span>
            <span>Más contaminado</span>
          </div>
        </div>
        
        <div className="map-stats">
          <div className="stat-item">
            <strong>📊 Países con datos:</strong> {new Set(emissionsData.filter(item => item.year === currentYear).map(item => item.entity)).size}
          </div>
          <div className="stat-item">
            <strong>🔥 Emisión máxima:</strong> {maxEmissions.toLocaleString()} t
          </div>
          <div className="stat-item">
            <strong>💨 Emisión mínima:</strong> {minEmissions.toLocaleString()} t
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldHeatMap;