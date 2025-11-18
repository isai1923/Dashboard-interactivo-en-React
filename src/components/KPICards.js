import React from 'react';

const KPICards = ({ globalEmissions, yearlyVariation, topCountries, latestYear }) => {
  const formatEmissions = (emissions) => {
    if (emissions >= 1e12) return `${(emissions / 1e12).toFixed(2)}T`;
    if (emissions >= 1e9) return `${(emissions / 1e9).toFixed(2)}B`;
    if (emissions >= 1e6) return `${(emissions / 1e6).toFixed(2)}M`;
    return emissions.toFixed(2);
  };

  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <h3>Emisiones Globales ({latestYear})</h3>
        <div className="kpi-value">{formatEmissions(globalEmissions)} toneladas</div>
        <div className="kpi-description">Total de emisiones anuales</div>
      </div>
      
      <div className="kpi-card">
        <h3>Variación Anual</h3>
        <div className={`kpi-value ${yearlyVariation > 0 ? 'positive' : 'negative'}`}>
          {yearlyVariation > 0 ? '+' : ''}{yearlyVariation}%
        </div>
        <div className="kpi-description">Cambio respecto al año anterior</div>
      </div>
      
      <div className="kpi-card">
        <h3>Mayor Emisor</h3>
        <div className="kpi-value">{topCountries[0]?.country || 'N/A'}</div>
        <div className="kpi-description">
          {topCountries[0] ? formatEmissions(topCountries[0].emissions) : '0'} toneladas
        </div>
      </div>
      
      <div className="kpi-card">
        <h3>Participación Top 5</h3>
        <div className="kpi-value">
          {topCountries.length > 0 
            ? `${((topCountries.reduce((sum, country) => sum + country.emissions, 0) / globalEmissions) * 100).toFixed(1)}%`
            : '0%'
          }
        </div>
        <div className="kpi-description">Del total global</div>
      </div>
    </div>
  );
};

export default KPICards;