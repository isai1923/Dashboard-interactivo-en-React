import { csv } from 'd3-fetch';
import Papa from 'papaparse';

// Lista de entidades que representan datos mundiales/regionales
const GLOBAL_ENTITIES = [
  'World', 'OWID_WRL', 'Africa', 'Asia', 'Europe', 'North America', 
  'South America', 'Oceania', 'European Union', 'Asia (excl. China and India)',
  'North America (excl. USA)', 'International transport', 'Non-OECD', 'OECD'
];

// Función auxiliar para construir rutas absolutas
const getCSVPath = (filename) => {
  // En desarrollo: usa la ruta relativa
  // En producción: usa la ruta absoluta desde el root del dominio
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.PUBLIC_URL}/data/${filename}`;
  }
  return `/data/${filename}`;
};

// Cargar datos de países desde co2-dataclean.csv
export const loadCountryData = async () => {
  const countryDataUrl = getCSVPath('co2-dataclean.csv');
  console.log('🌍 Cargando datos de países desde:', countryDataUrl);
  
  try {
    // Método 1: Usando d3-fetch
    const data = await csv(countryDataUrl);
    console.log('✅ Datos de países cargados con d3-fetch:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error cargando co2-dataclean.csv con d3-fetch:', error);
    
    // Método 2: Usando PapaParse como fallback
    return new Promise((resolve, reject) => {
      console.log('🔄 Intentando cargar con PapaParse...');
      Papa.parse(countryDataUrl, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('❌ Errores en PapaParse:', results.errors);
            reject(new Error(`Error parsing CSV: ${results.errors[0].message}`));
          } else {
            console.log('✅ Datos de países cargados con PapaParse:', results.data.length);
            resolve(results.data);
          }
        },
        error: (error) => {
          console.error('❌ Error fatal en PapaParse:', error);
          reject(error);
        }
      });
    });
  }
};

// Cargar datos mundiales desde co2-data.csv
export const loadWorldData = async () => {
  const worldDataUrl = getCSVPath('co2-data.csv');
  console.log('🌐 Cargando datos mundiales desde:', worldDataUrl);
  
  try {
    // Método 1: Usando d3-fetch
    const data = await csv(worldDataUrl);
    console.log('✅ Datos mundiales cargados con d3-fetch:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error cargando co2-data.csv con d3-fetch:', error);
    
    // Método 2: Usando PapaParse como fallback
    return new Promise((resolve, reject) => {
      console.log('🔄 Intentando cargar con PapaParse...');
      Papa.parse(worldDataUrl, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('❌ Errores en PapaParse:', results.errors);
            reject(new Error(`Error parsing CSV: ${results.errors[0].message}`));
          } else {
            console.log('✅ Datos mundiales cargados con PapaParse:', results.data.length);
            resolve(results.data);
          }
        },
        error: (error) => {
          console.error('❌ Error fatal en PapaParse:', error);
          reject(error);
        }
      });
    });
  }
};

// ... (el resto de las funciones se mantienen igual)
export const cleanCountryData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData
    .filter(item => {
      const hasEntity = item.Entity || item.country || item.entity;
      const hasYear = item.Year || item.year;
      const hasEmissions = item['Annual CO₂ emissions'] || item.emissions || item.co2;
      
      return hasEntity && hasYear && hasEmissions !== null && hasEmissions !== undefined;
    })
    .map(item => {
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

// ... (todas las demás funciones exportadas se mantienen igual)
export const getGlobalData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData
    .filter(item => {
      const entity = item.Entity || item.country || item.entity || '';
      const hasYear = item.Year || item.year;
      const hasEmissions = item['Annual CO₂ emissions'] || item.emissions || item.co2;
      
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

export const getCountryWithGrowth = (data, countryName, year) => {
  const currentYearData = data.find(item => item.entity === countryName && item.year === year);
  const previousYearData = data.find(item => item.entity === countryName && item.year === year - 1);
  
  if (!currentYearData) return null;
  
  const growth = previousYearData && previousYearData.emissions > 0 
    ? ((currentYearData.emissions - previousYearData.emissions) / previousYearData.emissions) * 100
    : 0;
  
  const yearData = data.filter(item => item.year === year);
  const sortedByEmissions = yearData.sort((a, b) => b.emissions - a.emissions);
  const globalRank = sortedByEmissions.findIndex(item => item.entity === countryName) + 1;
  
  return {
    ...currentYearData,
    growth: parseFloat(growth.toFixed(2)),
    globalRank: globalRank > 0 ? globalRank : null
  };
};

export const getTopCountries = (data, year, limit = 10, specificCountry = null) => {
  if (specificCountry) {
    const countryData = getCountryWithGrowth(data, specificCountry, year);
    return countryData ? [{
      country: countryData.entity,
      emissions: countryData.emissions,
      code: countryData.code,
      growth: countryData.growth,
      globalRank: countryData.globalRank
    }] : [];
  }
  
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

export const getMostContaminatedYear = (globalData) => {
  if (!globalData || globalData.length === 0) return null;
  
  return globalData.reduce((max, current) => 
    current.emissions > max.emissions ? current : max
  );
};

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

export const getDataForYear = (data, year) => {
  return data.filter(item => item.year === year);
};

export const normalizeCountryNames = (data) => {
  const nameMappings = {
    'United States': 'United States of America',
    'Russia': 'Russian Federation',
    'Iran': 'Iran (Islamic Republic of)',
    'South Korea': 'Korea, Republic of',
    'North Korea': "Korea, Democratic People's Republic of",
    'Vietnam': 'Viet Nam',
  };
  
  return data.map(item => ({
    ...item,
    entity: nameMappings[item.entity] || item.entity
  }));
};