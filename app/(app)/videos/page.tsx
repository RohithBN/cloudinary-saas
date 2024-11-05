'use client'
import React, { useEffect, useState } from 'react'
import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';
import axios from 'axios';

interface VideoResult {
    id: string;
    title: string;
    description: string;
    publicId: string;
    compressedSize: string;
    originalSize: string;
    duration: string;
    createdAt: Date;
    updatedAt: Date;
}

const Page = () => {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/videos');
        setVideos(response.data.videos);
      } catch (error: any) {
        console.log(error);
        setError("An error occurred while fetching the videos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []); // Empty dependency array

  const formatSize = (size: string) => {
    const sizeInMB = (parseInt(size) / (1024 * 1024)).toFixed(2); // Convert bytes to MB with 2 decimals
    return sizeInMB;
  };

  const handleDownload = async (videoId: string, videoTitle: string) => {
    // Construct the URL for the Cloudinary video file using its public ID
    const videoUrl = `https://res.cloudinary.com/cloudinary-saas-rohith/video/upload/v1/${videoId}`;

    try {
        // Fetch the video file
        const response = await fetch(videoUrl);
        
        // If the video is found and successfully fetched
        if (response.ok) {
            const blob = await response.blob();

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a hidden <a> tag to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${videoTitle.replace(/\s+/g, "_").toLowerCase()}.mp4`; // Set the file name for download

            // Programmatically trigger the link to start downloading
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Revoke the object URL after download to clean up
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Failed to fetch video for download');
        }
    } catch (error) {
        console.error('Error downloading the video:', error);
    }
};


  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-white mb-8">Video Library</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && <p className="text-center col-span-full text-lg text-gray-600">Loading...</p>}
        {error && <p className="text-center col-span-full text-lg text-red-500">{error}</p>}
        {videos.length === 0 && !isLoading && !error && <p className="text-center col-span-full text-lg text-gray-600">No videos available.</p>}

        {videos.map((video) => (
          <div key={video.id} className="video-item bg-white rounded-lg shadow-md overflow-hidden">
            {/* Video Player */}
            <div className="relative"> {/* Aspect ratio 16:9 */}
              <CldVideoPlayer
                width="1920"
              height="1080"
                src={video.publicId} // Cloudinary video URL
                controls
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mt-2">{video.title}</h2>
              <p className="text-gray-600 text-sm">{video.description}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div>
                  <p>Original Size: <span className="font-medium">{formatSize(video.originalSize)} MB</span></p>
                  <p>Compressed Size: <span className="font-medium">{formatSize(video.compressedSize)} MB</span></p>
                </div>
                <div>
                  {/* Download Button */}
                 <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                 onClick={()=>handleDownload(video.publicId, video.title)}
                 >
                    Download
                 </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
