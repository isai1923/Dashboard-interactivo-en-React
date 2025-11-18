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

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CountryComparison = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  // Ordenar datos por emisiones (de mayor a menor)
  const sortedData = [...data].sort((a, b) => b.emissions - a.emissions);

  const chartData = {
    labels: sortedData.map(d => d.country),
    datasets: [
      {
        label: 'Emisiones (toneladas)',
        data: sortedData.map(d => d.emissions),
        backgroundColor: [
          '#2E8B57',
          '#3DA56B',
          '#4CBF7F',
          '#5BD993',
          '#6AF3A7'
        ],
        borderColor: [
          '#26734A',
          '#318C5A',
          '#3CA56A',
          '#47BE7A',
          '#52D78A'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Emisiones: ${new Intl.NumberFormat('es-MX').format(context.parsed.x)} toneladas`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
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
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'País'
        }
      }
    },
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CountryComparison;