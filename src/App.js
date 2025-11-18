import React, { useState, useEffect } from 'react';
import { 
  loadCountryData,
  loadWorldData,
  cleanCountryData, 
  aggregateByYear, 
  getTopCountries, 
  calculateYearlyVariation,
  filterByYearRange,
  getGlobalData,
  getTopContaminatedYears,
  getMostContaminatedYear
} from './utils/dataCleaning';
import KPICards from './components/KPICards';
import EmissionsChart from './components/EmissionsChart';
import CountryComparison from './components/CountryComparison';
import GlobalContamination from './components/GlobalContamination';
import WorldHeatMap from './components/WorldHeatMap';
import Filters from './components/Filters';
import './styles/dashboard.css';

function App() {
  const [countryData, setCountryData] = useState([]);
  const [worldData, setWorldData] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('countries');
  const [mapYear, setMapYear] = useState(2020);
  
  const [filters, setFilters] = useState({
    startYear: 1990,
    endYear: 2023,
    selectedCountry: 'all'
  });

  // Cargar ambos datasets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📥 Cargando datos desde CSVs...');
        
        // Cargar datos de países (co2-dataclean.csv)
        const countryCSVData = await loadCountryData();
        console.log('Datos de países cargados:', countryCSVData.length);
        
        const cleanedCountryData = cleanCountryData(countryCSVData);
        console.log('Datos de países limpiados:', cleanedCountryData.length);
        setCountryData(cleanedCountryData);
        
        // Cargar datos mundiales (co2-data.csv)
        const worldCSVData = await loadWorldData();
        console.log('Datos mundiales cargados:', worldCSVData.length);
        
        const global = getGlobalData(worldCSVData);
        console.log('Datos globales extraídos:', global.length);
        setWorldData(worldCSVData);
        setGlobalData(global);
        
        // Establecer año inicial para el mapa
        if (cleanedCountryData.length > 0) {
          const latestYear = Math.max(...cleanedCountryData.map(d => d.year));
          setMapYear(latestYear);
        }
        
      } catch (err) {
        setError('Error cargando los datos CSV: ' + err.message);
        console.error('Error loading CSV data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    if (countryData.length > 0) {
      let filtered = filterByYearRange(countryData, filters.startYear, filters.endYear);
      
      if (filters.selectedCountry !== 'all') {
        filtered = filtered.filter(item => item.entity === filters.selectedCountry);
      }
      
      setFilteredData(filtered);
    }
  }, [countryData, filters]);

  // Datos procesados para visualizaciones de PAÍSES
  const aggregatedData = aggregateByYear(filteredData);
  const dataWithVariation = calculateYearlyVariation(aggregatedData);
  
  // Encontrar el año más reciente en los datos de países
  const latestYear = aggregatedData.length > 0 
    ? Math.max(...aggregatedData.map(d => d.year)) 
    : new Date().getFullYear() - 1;
  
  const topCountries = getTopCountries(countryData, latestYear, 5);
  const latestGlobalEmissions = aggregatedData.find(d => d.year === latestYear)?.totalEmissions || 0;

  // Datos para la nueva sección global
  const topContaminatedYears = getTopContaminatedYears(globalData, 5);
  const mostContaminatedYear = getMostContaminatedYear(globalData);

  // Obtener lista de países únicos para el filtro
  const uniqueCountries = [...new Set(countryData.map(item => item.entity))].sort();

  // Datos para el mapa (todos los países del año seleccionado)
  const mapData = countryData.filter(item => item.year === mapYear);

  // Obtener años disponibles para el mapa
  const availableYears = countryData.length > 0 
    ? [...new Set(countryData.map(item => item.year))].sort((a, b) => a - b)
    : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando datos de emisiones de CO₂...</p>
          <p>📁 Cargando: co2-dataclean.csv (países) y co2-data.csv (mundial)</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard de Análisis de Emisiones de CO₂</h1>
        <p>Visualización de datos históricos de emisiones globales</p>
        <div className="data-stats">
          <span>🇺🇸 {countryData.length.toLocaleString()} registros de países</span>
          <span>🌍 {uniqueCountries.length} países/regiones</span>
          <span>📊 {globalData.length} años de datos mundiales</span>
          <span>🗺️ Mapa interactivo disponible</span>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'countries' ? 'active' : ''}`}
          onClick={() => setActiveTab('countries')}
        >
          🇺🇸 Análisis por Países
        </button>
        <button 
          className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Contaminación Mundial
        </button>
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Mapa Mundial
        </button>
      </div>

      {/* Pestaña: Análisis por Países */}
      {activeTab === 'countries' && (
        <>
          <div className="data-source-info">
            <p><strong>Fuente:</strong> co2-dataclean.csv - Datos específicos por país y continente</p>
          </div>

          <Filters 
            filters={filters} 
            onFiltersChange={setFilters}
            countries={uniqueCountries}
          />

          <KPICards 
            globalEmissions={latestGlobalEmissions}
            yearlyVariation={dataWithVariation[dataWithVariation.length - 1]?.variation || 0}
            topCountries={topCountries}
            latestYear={latestYear}
          />

          <div className="charts-grid">
            <div className="chart-container full-width">
              <EmissionsChart 
                data={dataWithVariation}
                title="Tendencia de Emisiones por Países"
                showVariation={true}
              />
            </div>
            
            <div className="chart-container">
              <CountryComparison 
                data={topCountries}
                title={`Top 5 Países Emisores (${latestYear})`}
              />
            </div>
            
            <div className="chart-container">
              <h3>📋 Información del Dataset</h3>
              <div className="data-summary">
                <p><strong>📁 Fuente:</strong> co2-dataclean.csv</p>
                <p><strong>📊 Total de registros:</strong> {countryData.length.toLocaleString()}</p>
                <p><strong>🌍 Países/Regiones:</strong> {uniqueCountries.length}</p>
                <p><strong>📅 Período:</strong> {Math.min(...countryData.map(d => d.year))} - {Math.max(...countryData.map(d => d.year))}</p>
                <p><strong>🕐 Última actualización:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Tabla de datos para referencia */}
          <div className="data-table-container">
            <h3>👀 Vista Previa de Datos de Países ({filteredData.length} registros)</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>País/Región</th>
                    <th>Año</th>
                    <th>Emisiones (toneladas)</th>
                    <th>Código</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{item.entity}</td>
                      <td>{item.year}</td>
                      <td>{item.emissions.toLocaleString()}</td>
                      <td>{item.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 10 && (
                <p className="table-footer">Mostrando 10 de {filteredData.length} registros</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pestaña: Contaminación Mundial */}
      {activeTab === 'global' && (
        <>
          <div className="data-source-info">
            <p><strong>Fuente:</strong> co2-data.csv - Datos mundiales completos (incluye World/OWID_WRL)</p>
          </div>
          
          <GlobalContamination 
            topYears={topContaminatedYears}
            mostContaminatedYear={mostContaminatedYear}
          />

          {/* Información adicional del dataset mundial */}
          <div className="data-table-container">
            <h3>📊 Información del Dataset Mundial</h3>
            <div className="data-summary">
              <p><strong>📁 Fuente:</strong> co2-data.csv</p>
              <p><strong>🌐 Datos mundiales:</strong> {globalData.length} años de registros</p>
              <p><strong>📅 Período cubierto:</strong> {globalData.length > 0 ? 
                `${Math.min(...globalData.map(d => d.year))} - ${Math.max(...globalData.map(d => d.year))}` : 
                'No disponible'}</p>
              <p><strong>🔥 Emisión más alta:</strong> {mostContaminatedYear ? 
                `${mostContaminatedYear.year}: ${mostContaminatedYear.emissions.toLocaleString()} toneladas` : 
                'No disponible'}</p>
              <p><strong>📈 Tendencias analizadas:</strong> Top 5 años más contaminados y evolución histórica</p>
            </div>
          </div>
        </>
      )}

      {/* Pestaña: Mapa Mundial */}
      {activeTab === 'map' && (
        <>
          <div className="data-source-info">
            <p><strong>Fuente:</strong> co2-dataclean.csv - Datos por país visualizados en mapa mundial</p>
          </div>
          
          <WorldHeatMap 
            emissionsData={countryData}
            year={mapYear}
          />
          
          {/* Control de año para el mapa */}
          <div className="map-year-control">
            <h3>🎯 Seleccionar Año para el Mapa</h3>
            <div className="year-slider-container">
              <input 
                type="range" 
                min={availableYears[0] || 1990}
                max={availableYears[availableYears.length - 1] || 2023}
                value={mapYear}
                onChange={(e) => setMapYear(parseInt(e.target.value))}
                className="slider"
                list="year-markers"
              />
              <datalist id="year-markers">
                {availableYears.filter((year, index) => index % 10 === 0).map(year => (
                  <option key={year} value={year} label={year}></option>
                ))}
              </datalist>
              <div className="slider-labels">
                <span>{availableYears[0] || 1990}</span>
                <span className="current-year">📅 {mapYear}</span>
                <span>{availableYears[availableYears.length - 1] || 2023}</span>
              </div>
            </div>
            
            <div className="quick-year-buttons">
              <p>🚀 Saltar a año rápido:</p>
              {[1990, 2000, 2010, 2020].map(quickYear => (
                availableYears.includes(quickYear) && (
                  <button
                    key={quickYear}
                    onClick={() => setMapYear(quickYear)}
                    className={`quick-btn ${mapYear === quickYear ? 'active' : ''}`}
                  >
                    {quickYear}
                  </button>
                )
              ))}
            </div>

            <div className="map-instructions">
              <h4>💡 Cómo usar el mapa:</h4>
              <ul>
                <li>🔍 <strong>Zoom:</strong> Usa la rueda del mouse o los botones +/-</li>
                <li>🖱️ <strong>Navegar:</strong> Arrastra el mapa para moverte</li>
                <li>ℹ️ <strong>Información:</strong> Pasa el mouse sobre un país para ver detalles</li>
                <li>🎨 <strong>Colores:</strong> Rojo más oscuro = más emisiones</li>
              </ul>
            </div>
          </div>

          {/* Estadísticas del mapa */}
          <div className="data-table-container">
            <h3>📈 Estadísticas del Mapa ({mapYear})</h3>
            <div className="charts-grid">
              <div className="chart-container">
                <div className="data-summary">
                  <p><strong>🌍 Países con datos:</strong> {new Set(countryData.filter(item => item.year === mapYear).map(item => item.entity)).size}</p>
                  <p><strong>📊 Total de registros:</strong> {countryData.filter(item => item.year === mapYear).length}</p>
                  <p><strong>🔥 Emisión máxima:</strong> {Math.max(...countryData.filter(item => item.year === mapYear).map(item => item.emissions)).toLocaleString()} t</p>
                  <p><strong>💨 Emisión mínima:</strong> {Math.min(...countryData.filter(item => item.year === mapYear).map(item => item.emissions)).toLocaleString()} t</p>
                </div>
              </div>
              
              <div className="chart-container">
                <h4>🏆 Top 5 Países ({mapYear})</h4>
                <div className="top-countries-list">
                  {getTopCountries(countryData, mapYear, 5).map((country, index) => (
                    <div key={country.country} className="country-rank-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="country-name">{country.country}</span>
                      <span className="country-emissions">{country.emissions.toLocaleString()} t</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;