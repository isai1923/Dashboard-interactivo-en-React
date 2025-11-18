import React from 'react';

const Filters = ({ filters, onFiltersChange, countries }) => {
  // Generar años desde 1750 hasta el actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1750 + 1 }, (_, i) => 1750 + i);

  const handleFilterChange = (filterName, value) => {
    onFiltersChange({
      ...filters,
      [filterName]: value
    });
  };

  return (
    <div className="filters-container">
      <div className="filter-group">
        <label>Año Inicial:</label>
        <select 
          value={filters.startYear} 
          onChange={(e) => handleFilterChange('startYear', parseInt(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Año Final:</label>
        <select 
          value={filters.endYear} 
          onChange={(e) => handleFilterChange('endYear', parseInt(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>País:</label>
        <select 
          value={filters.selectedCountry} 
          onChange={(e) => handleFilterChange('selectedCountry', e.target.value)}
        >
          <option value="all">Todos los países</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button 
          onClick={() => onFiltersChange({
            startYear: 1990,
            endYear: 2023,
            selectedCountry: 'all'
          })}
          className="reset-btn"
        >
          Restablecer Filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;