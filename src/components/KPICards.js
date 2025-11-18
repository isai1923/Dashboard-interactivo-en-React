import React from 'react';

const KPICards = ({ globalEmissions, yearlyVariation, topCountries, latestYear, isSingleCountry = false, countryName = '' }) => {
  const formatEmissions = (emissions) => {
    if (emissions >= 1e12) return `${(emissions / 1e12).toFixed(2)}T`;
    if (emissions >= 1e9) return `${(emissions / 1e9).toFixed(2)}B`;
    if (emissions >= 1e6) return `${(emissions / 1e6).toFixed(2)}M`;
    if (emissions >= 1e3) return `${(emissions / 1e3).toFixed(2)}K`;
    return emissions.toFixed(2);
  };

  const calculateTop5Share = () => {
    if (!topCountries || topCountries.length === 0 || globalEmissions === 0) return 0;
    const top5Total = topCountries.reduce((sum, country) => sum + country.emissions, 0);
    return (top5Total / globalEmissions) * 100;
  };

  // Calcular crecimiento desde el año anterior (si es un solo país)
  const calculateCountryGrowth = () => {
    if (!topCountries || topCountries.length === 0) return 0;
    // En modo país único, topCountries[0] es el país seleccionado
    return topCountries[0]?.growth || 0;
  };

  // Si estamos viendo un solo país, mostramos métricas diferentes
  if (isSingleCountry) {
    const countryData = topCountries[0];
    return (
      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Emisiones de {countryName} ({latestYear})</h3>
          <div className="kpi-value">{formatEmissions(countryData?.emissions || 0)}</div>
          <div className="kpi-description">toneladas de CO₂</div>
        </div>
        
        <div className="kpi-card">
          <h3>Crecimiento Anual</h3>
          <div className={`kpi-value ${calculateCountryGrowth() > 0 ? 'positive' : calculateCountryGrowth() < 0 ? 'negative' : 'neutral'}`}>
            {calculateCountryGrowth() > 0 ? '+' : ''}{calculateCountryGrowth()}%
          </div>
          <div className="kpi-description">cambio respecto al año anterior</div>
        </div>
        
        <div className="kpi-card">
          <h3>Posición Global</h3>
          <div className="kpi-value">
            {topCountries[0]?.globalRank ? `#${topCountries[0].globalRank}` : 'N/A'}
          </div>
          <div className="kpi-description">ranking mundial</div>
        </div>
        
        <div className="kpi-card">
          <h3>Contribución Global</h3>
          <div className="kpi-value">
            {globalEmissions > 0 ? ((countryData?.emissions / globalEmissions) * 100).toFixed(3) : '0'}%
          </div>
          <div className="kpi-description">del total mundial</div>
        </div>
      </div>
    );
  }

  // Modo normal (todos los países)
  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <h3>Emisiones Globales ({latestYear})</h3>
        <div className="kpi-value">{formatEmissions(globalEmissions)}</div>
        <div className="kpi-description">toneladas de CO₂</div>
      </div>
      
      <div className="kpi-card">
        <h3>Variación Anual</h3>
        <div className={`kpi-value ${yearlyVariation > 0 ? 'positive' : yearlyVariation < 0 ? 'negative' : 'neutral'}`}>
          {yearlyVariation > 0 ? '+' : ''}{yearlyVariation}%
        </div>
        <div className="kpi-description">cambio respecto al año anterior</div>
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
          {calculateTop5Share().toFixed(1)}%
        </div>
        <div className="kpi-description">del total global</div>
      </div>
    </div>
  );
};

export default KPICards;