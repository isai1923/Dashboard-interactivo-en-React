import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GlobalContamination = ({ topYears, mostContaminatedYear }) => {
  if (!topYears || topYears.length === 0) {
    return (
      <div className="chart-container">
        <h3>Top Años Más Contaminados a Nivel Mundial</h3>
        <p>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const chartData = {
    labels: topYears.map(item => item.year),
    datasets: [
      {
        label: 'Emisiones Globales (toneladas)',
        data: topYears.map(item => item.emissions),
        backgroundColor: [
          '#e74c3c', // Rojo para el más contaminado
          '#f39c12', // Naranja
          '#f1c40f', // Amarillo
          '#2ecc71', // Verde
          '#3498db'  // Azul
        ],
        borderColor: [
          '#c0392b',
          '#d35400',
          '#f39c12',
          '#27ae60',
          '#2980b9'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Años Más Contaminados a Nivel Mundial',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Emisiones: ${new Intl.NumberFormat('es-MX').format(context.parsed.y)} toneladas`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Año'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Toneladas de CO₂'
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000000) {
              return (value / 1000000000).toFixed(1) + 'B';
            }
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            return value;
          }
        }
      }
    },
  };

  const formatEmissions = (emissions) => {
    if (emissions >= 1e12) return `${(emissions / 1e12).toFixed(2)} billones`;
    if (emissions >= 1e9) return `${(emissions / 1e9).toFixed(2)} mil millones`;
    if (emissions >= 1e6) return `${(emissions / 1e6).toFixed(2)} millones`;
    return emissions.toLocaleString();
  };

  return (
    <div className="global-contamination">
      <div className="contamination-header">
        <h2>🌍 Contaminación Mundial</h2>
        {mostContaminatedYear && (
          <div className="most-contaminated-year">
            <h3>📅 Año Más Contaminado de la Historia</h3>
            <div className="year-card">
              <div className="year">{mostContaminatedYear.year}</div>
              <div className="emissions">{formatEmissions(mostContaminatedYear.emissions)} toneladas de CO₂</div>
              <div className="description">
                Este año registró las mayores emisiones globales de CO₂ en la historia
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>

      <div className="top-years-list">
        <h4>📊 Ranking de Años Más Contaminados</h4>
        <div className="years-grid">
          {topYears.map((item, index) => (
            <div key={item.year} className={`year-item rank-${item.rank}`}>
              <div className="rank">#{item.rank}</div>
              <div className="year">{item.year}</div>
              <div className="emissions">{formatEmissions(item.emissions)} t</div>
              <div className="trend">
                {index > 0 && (
                  <span className={`trend-${item.emissions > topYears[index - 1].emissions ? 'up' : 'down'}`}>
                    {item.emissions > topYears[index - 1].emissions ? '↗' : '↘'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalContamination;