import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('https://backend-six-wheat.vercel.app/');

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    axios.get('https://backend-six-wheat.vercel.app/api/videos')
      .then(response => {
        setVideos(response.data);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
      });

    return () => {
      socket.off('videoViewed');
    };
  }, []);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    axios.post('https://backend-six-wheat.vercel.app/api/view', { videoId: video.videoId, title: video.title })
      .catch(error => {
        console.error('Error reporting video view:', error);
      });
  };

  return (
    <div className="video-list">
      <h1 className="my-4">Nuestros trabajos</h1>
      <div className="row">
        {videos.map(video => (
          <div className="col-md-4 mb-4" key={video.videoId}>
            <div className="card" onClick={() => handleVideoSelect(video)}>
              <img src={video.thumbnail} className="card-img-top" alt={video.title} />
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedVideo && (
        <div className="video-player mt-4">
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedVideo.title}
            className="w-100"
            style={{ height: '500px' }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoList;
