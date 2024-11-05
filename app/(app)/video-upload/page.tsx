'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const router = useRouter();
  const MAX_SIZE = 60 * 1024 * 1024;

  const handleMaxSize = () => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert('File size is too large');
      setFile(null); // Reset the file input
      return;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // File validation
    if (!file) {
        alert("Please select a file");
        return;
    }

    // Max size validation
    handleMaxSize();

    // Title and description validation
    if (!title || !description) {
        alert("Please fill in all fields");
        return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file?.size.toString() || "");

    // Set uploading state
    setIsUploading(true);

    try {
        const response = await axios.post("/api/video-upload", formData);

        // Assuming success if no errors are thrown
        console.log(response.data);
        router.push("/videos");  // Navigate to the video page upon success
    } catch (error: any) {
        // Capture the error and show appropriate error message
        console.error("Error during file upload:", error);

        // Handle the error based on the response from the server
        if (error.response) {
            alert(`Upload failed: ${error.response.data.error || "Unknown error"}`);
        } else {
            alert("Something went wrong with the request.");
        }
    } finally {
        // Reset uploading state after the request is finished
        setIsUploading(false);
    }
};


  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full bg-slate-200 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-black">Upload Your Video</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input input-bordered w-full mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="input input-bordered w-full mt-2"
            />
          </div>

          {/* File input */}
          <div>
            <label htmlFor="file" >Select Video</label>
            <input
              id="file"
              type="file"
              accept=".mp4"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="file-input file-input-bordered w-full mt-2"
              placeholder='Select file'
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading}
              className={`btn btn-primary w-full mt-4 ${isUploading ? 'loading' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
