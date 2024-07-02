import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

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
      <h1>Video Player</h1>
      {videos.map(video => (
        <div key={video.videoId} onClick={() => handleVideoSelect(video)}>
          <img src={video.thumbnail} alt={video.title} />
          <h3>{video.title}</h3>
        </div>
      ))}
      {selectedVideo && (
        <div className="video-player">
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedVideo.title}
          />
        </div>
      )}
    </div>
  );
};

export default VideoList;
