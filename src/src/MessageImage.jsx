import React from "react";
import { useState,useEffect } from "react";
export default function MessageImage ({filename,token,baseurl}){
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`${baseurl}getfile/${filename}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setLoading(false);
        console.log("url ",url)

      } catch (err) {
        console.error('Error fetching image:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [filename]);

  if (loading) {
    return <div className="image-loading">Loading image...</div>;
  }

  if (error) {
    return <div className="image-error">Failed to load image</div>;
  }

  return (
    <div className="message-media">
      <img 
        src={imageUrl}
        alt="Shared image"
        className="message-image"
        onClick={() => window.open(imageUrl, '_blank')}
      />
      <a 
        href={imageUrl} 
        download={filename}
        className="image-download-btn"
      >
        ⬇️ Download
      </a>
    </div>
  );
}
