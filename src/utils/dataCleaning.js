import { csv } from 'd3-fetch';
import Papa from 'papaparse';

// Lista de entidades que representan datos mundiales/regionales
const GLOBAL_ENTITIES = [
  'World', 'OWID_WRL', 'Africa', 'Asia', 'Europe', 'North America', 
  'South America', 'Oceania', 'European Union', 'Asia (excl. China and India)',
  'North America (excl. USA)', 'International transport', 'Non-OECD', 'OECD'
];

// Cargar datos de países desde co2-dataclean.csv
export const loadCountryData = async () => {
  try {
    // Método 1: Usando d3-fetch
    const data = await csv('/data/co2-dataclean.csv');
    return data;
  } catch (error) {
    console.error('Error cargando co2-dataclean.csv con d3-fetch:', error);
    
    // Método 2: Usando PapaParse como fallback
    return new Promise((resolve, reject) => {
      Papa.parse('/data/co2-dataclean.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
};

// Cargar datos mundiales desde co2-data.csv
export const loadWorldData = async () => {
  try {
    // Método 1: Usando d3-fetch
    const data = await csv('/data/co2-data.csv');
    return data;
  } catch (error) {
    console.error('Error cargando co2-data.csv con d3-fetch:', error);
    
    // Método 2: Usando PapaParse como fallback
    return new Promise((resolve, reject) => {
      Papa.parse('/data/co2-data.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
};

// Limpiar y procesar datos de países (co2-dataclean.csv)
export const cleanCountryData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData
    .filter(item => {
      // Verificar que tenga los campos necesarios
      const hasEntity = item.Entity || item.country || item.entity;
      const hasYear = item.Year || item.year;
      const hasEmissions = item['Annual CO₂ emissions'] || item.emissions || item.co2;
      
      return hasEntity && hasYear && hasEmissions !== null && hasEmissions !== undefined;
    })
    .map(item => {
      // Normalizar nombres de campos
      const entity = item.Entity || item.country || item.entity || 'Unknown';
      const year = parseInt(item.Year || item.year);
      const emissions = parseFloat(item['Annual CO₂ emissions'] || item.emissions || item.co2 || 0);
      const code = item.Code || item.code || item.iso_code || '';
      
      return {
        entity,
        code,
        year,
        emissions,
        isValid: !isNaN(year) && !isNaN(emissions) && emissions >= 0 && year >= 1750
      };
    })
    .filter(item => item.isValid)
    .sort((a, b) => a.year - b.year);
};

// Obtener datos mundiales específicos (de co2-data.csv)
export const getGlobalData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData
    .filter(item => {
      const entity = item.Entity || item.country || item.entity || '';
      const hasYear = item.Year || item.year;
      const hasEmissions = item['Annual CO₂ emissions'] || item.emissions || item.co2;
      
      // INCLUIR SOLO datos mundiales
      const isWorld = entity === 'World' || entity === 'OWID_WRL';
      
      return isWorld && hasYear && hasEmissions !== null && hasEmissions !== undefined;
    })
    .map(item => {
      const entity = item.Entity || item.country || item.entity;
      const year = parseInt(item.Year || item.year);
      const emissions = parseFloat(item['Annual CO₂ emissions'] || item.emissions || item.co2 || 0);
      
      return {
        entity,
        year,
        emissions,
        isValid: !isNaN(year) && !isNaN(emissions) && emissions >= 0
      };
    })
    .filter(item => item.isValid)
    .sort((a, b) => a.year - b.year);
};

// Función para obtener datos de un país específico con crecimiento
export const getCountryWithGrowth = (data, countryName, year) => {
  const currentYearData = data.find(item => item.entity === countryName && item.year === year);
  const previousYearData = data.find(item => item.entity === countryName && item.year === year - 1);
  
  if (!currentYearData) return null;
  
  const growth = previousYearData && previousYearData.emissions > 0 
    ? ((currentYearData.emissions - previousYearData.emissions) / previousYearData.emissions) * 100
    : 0;
  
  // Calcular ranking global
  const yearData = data.filter(item => item.year === year);
  const sortedByEmissions = yearData.sort((a, b) => b.emissions - a.emissions);
  const globalRank = sortedByEmissions.findIndex(item => item.entity === countryName) + 1;
  
  return {
    ...currentYearData,
    growth: parseFloat(growth.toFixed(2)),
    globalRank: globalRank > 0 ? globalRank : null
  };
};

// Función actualizada para getTopCountries que maneje país individual
export const getTopCountries = (data, year, limit = 10, specificCountry = null) => {
  if (specificCountry) {
    // Modo país específico
    const countryData = getCountryWithGrowth(data, specificCountry, year);
    return countryData ? [{
      country: countryData.entity,
      emissions: countryData.emissions,
      code: countryData.code,
      growth: countryData.growth,
      globalRank: countryData.globalRank
    }] : [];
  }
  
  // Modo normal (top países)
  const yearData = data.filter(item => item.year === year);
  
  return yearData
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, limit)
    .map(item => ({
      country: item.entity,
      emissions: item.emissions,
      code: item.code
    }));
};

// Obtener los años más contaminados a nivel mundial
export const getTopContaminatedYears = (globalData, limit = 5) => {
  return [...globalData]
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      year: item.year,
      emissions: item.emissions,
      entity: item.entity
    }));
};

// Obtener el año más contaminado
export const getMostContaminatedYear = (globalData) => {
  if (!globalData || globalData.length === 0) return null;
  
  return globalData.reduce((max, current) => 
    current.emissions > max.emissions ? current : max
  );
};

// Funciones de agregación para países
export const aggregateByYear = (data) => {
  const yearlyAggregation = {};
  
  data.forEach(item => {
    if (!yearlyAggregation[item.year]) {
      yearlyAggregation[item.year] = 0;
    }
    yearlyAggregation[item.year] += item.emissions;
  });
  
  return Object.entries(yearlyAggregation)
    .map(([year, emissions]) => ({
      year: parseInt(year),
      totalEmissions: emissions
    }))
    .sort((a, b) => a.year - b.year);
};

export const calculateYearlyVariation = (aggregatedData) => {
  if (!aggregatedData || aggregatedData.length === 0) return [];
  
  return aggregatedData.map((current, index) => {
    if (index === 0) return { ...current, variation: 0 };
    
    const previous = aggregatedData[index - 1];
    const variation = previous.totalEmissions > 0 
      ? ((current.totalEmissions - previous.totalEmissions) / previous.totalEmissions) * 100
      : 0;
    
    return {
      ...current,
      variation: parseFloat(variation.toFixed(2))
    };
  });
};

export const filterByYearRange = (data, startYear, endYear) => {
  return data.filter(item => item.year >= startYear && item.year <= endYear);
};

export const getCountryData = (data, countryName) => {
  return data
    .filter(item => item.entity === countryName)
    .sort((a, b) => a.year - b.year);
};

// Función para obtener datos de un año específico para el mapa
export const getDataForYear = (data, year) => {
  return data.filter(item => item.year === year);
};

// Función para normalizar nombres de países (opcional, para mejor matching con el geoJSON)
export const normalizeCountryNames = (data) => {
  const nameMappings = {
    'United States': 'United States of America',
    'Russia': 'Russian Federation',
    'Iran': 'Iran (Islamic Republic of)',
    'South Korea': 'Korea, Republic of',
    'North Korea': "Korea, Democratic People's Republic of",
    'Vietnam': 'Viet Nam',
    // Agrega más mapeos según sea necesario
  };
  
  return data.map(item => ({
    ...item,
    entity: nameMappings[item.entity] || item.entity
  }));
};