import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

Chart.register(...registerables);

const socket = io('https://backend-six-wheat.vercel.app/', { transports: ['websocket', 'polling', 'flashsocket'] });

const VideoResults = () => {
  const [videoViews, setVideoViews] = useState([]);

  useEffect(() => {
    axios.get('https://backend-six-wheat.vercel.app/api/videoViews')
      .then(response => {
        setVideoViews(response.data);
      })
      .catch(error => {
        console.error('Error fetching video views:', error);
      });

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

    return () => {
      socket.off('videoViewed');
    };
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Top 20 Most Viewed Videos", 14, 20);
    const tableColumn = ["Title", "Views"];
    const tableRows = [];
    videoViews.sort((a, b) => b.views - a.views).slice(0, 20).forEach(video => {
      const videoData = [video.title, video.views];
      tableRows.push(videoData);
    });
    doc.autoTable(tableColumn, tableRows, { startY: 30 });
    doc.save('video_views.pdf');
  };

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
    indexAxis: 'y',
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
    <div className="video-views container">
      <h2 className="my-4">ANÁLISIS DE VISTAS</h2>
      
        <Bar data={data} options={options} />
      
      <div className="mb-4">
        <h3 className="mb-3">Top 20 Videos Más Vistos</h3>
        <div className="list-group">
          {videoViews.sort((a, b) => b.views - a.views).slice(0, 20).map((video, index) => (
            <div key={video.videoId} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{index + 1}. {video.title}</h5>
              </div>
              <span className="badge bg-primary rounded-pill">{video.views} views</span>
            </div>
          ))}
        </div>
      </div>
      <button className="btn btn-primary mt-3" onClick={generatePDF}>Generar PDF</button>
    </div>
  );
};

export default VideoResults;
