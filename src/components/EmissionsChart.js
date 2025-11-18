import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EmissionsChart = ({ data, title, showVariation = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Emisiones Globales (toneladas)',
        data: data.map(d => d.totalEmissions),
        borderColor: '#2E8B57',
        backgroundColor: 'rgba(46, 139, 87, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  };

  // Si se solicita mostrar variación, agregar segundo dataset
  if (showVariation) {
    chartData.datasets.push({
      label: 'Variación % Interanual',
      data: data.map(d => d.variation || 0),
      borderColor: '#F2C94C',
      backgroundColor: 'rgba(242, 201, 76, 0.1)',
      fill: false,
      tension: 0.4,
      yAxisID: 'y1',
      borderDash: [5, 5],
    });
  }

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              label += new Intl.NumberFormat('es-MX').format(context.parsed.y) + ' toneladas';
            } else {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Año'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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
      y1: {
        type: 'linear',
        display: showVariation,
        position: 'right',
        title: {
          display: true,
          text: 'Variación %'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default EmissionsChart;