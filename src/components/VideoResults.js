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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Video Views Report', 14, 16);
    doc.autoTable({
      head: [['Video Title', 'Views']],
      body: videoViews.map(video => [video.title, video.views]),
      startY: 20,
    });
    doc.save('video_views_report.pdf');
  };

  return (
    <div className="video-views mt-4">
      <h2 className="mb-4">Resultados</h2>
      <Bar data={data} options={options} />
      <button className="btn btn-primary mt-4" onClick={generatePDF}>Generar PDF</button>
      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Thumbnail</th>
            <th scope="col">Title</th>
            <th scope="col">Views</th>
          </tr>
        </thead>
        <tbody>
          {videoViews.sort((a, b) => b.views - a.views).slice(0, 10).map((video, index) => (
            <tr key={video.videoId}>
              <th scope="row">{index + 1}</th>
              <td><img src={video.thumbnail} alt={video.title} style={{ width: '100px', height: 'auto' }} /></td>
              <td>{video.title}</td>
              <td>{video.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoResults;
