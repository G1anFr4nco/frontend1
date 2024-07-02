import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const backendURL = process.env.REACT_APP_BACKEND_URL;
const socket = io(backendURL);

const VideoResults = () => {
  const [videoViews, setVideoViews] = useState([]);

  useEffect(() => {
    // Solicitar los datos actuales de los videos al montar el componente
    axios.get(`${backendURL}/api/videoViews`)
      .then(response => {
        setVideoViews(response.data);
      })
      .catch(error => {
        console.error('Error fetching video views:', error);
      });

    // Actualizar la lista de vistas de los videos cuando se recibe un evento de socket
    socket.on('videoViewed', (data) => {
      setVideoViews((prevViews) => {
        const index = prevViews.findIndex(v => v.videoId === data.videoId);
        if (index !== -1) {
          const updatedViews = [...prevViews];
          updatedViews[index].views = data.views;
          return updatedViews;
        } else {
          return [...prevViews, data];
        }
      });
    });

    // Limpiar el socket al desmontar el componente
    return () => {
      socket.off('videoViewed');
    };
  }, []);

  // Prepara los datos para el gráfico de barras
  const data = {
    labels: videoViews.map(video => video.title),
    datasets: [
      {
        label: 'Views',
        data: videoViews.map(video => video.views),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Para un gráfico de barras horizontal
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            const maxViews = Math.max(...videoViews.map(video => video.views));
            return (value / maxViews * 100).toFixed(2) + '%';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw + ' views';
          }
        }
      }
    }
  };

  return (
    <div className="video-views">
      <h2>Video Views</h2>
      <Bar data={data} options={options} />
      {videoViews.sort((a, b) => b.views - a.views).slice(0, 10).map(video => (
        <div key={video.videoId}>
          <h3>{video.title} - {video.views} views</h3>
        </div>
      ))}
    </div>
  );
};

export default VideoResults;
