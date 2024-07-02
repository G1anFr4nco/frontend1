import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    axios.get(`https://backend-six-wheat.vercel.app/api/video/${videoId}`)
      .then(response => {
        setVideo(response.data);
      })
      .catch(error => {
        console.error('Error fetching video details:', error);
      });
  }, [videoId]);

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              className="embed-responsive-item"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>
          <h3 className="mt-4">{video.title}</h3>
          <p>{video.views} views</p>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
