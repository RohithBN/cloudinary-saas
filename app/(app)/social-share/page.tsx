'use client';
import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react';

const imageFormats = {
    "Instagram Post": {
        width: 1080,
        height: 1080,
        aspectRatio: "1:1" // 1:1 is valid
    },
   
    "Facebook Post": {
        width: 1200,
        height: 630,
        aspectRatio: "1200:630" // Changed to valid ratio
    },
    "Twitter Post": {
        width: 1200,
        height: 675,
        aspectRatio: "16:9" // 16:9 is valid
    },
    "YouTube Thumbnail": {
        width: 1280,
        height: 720,
        aspectRatio: "16:9" // 16:9 is valid
    },
    "LinkedIn Post": {
        width: 1200,
        height: 627,
        aspectRatio: "1200:627" // Changed to valid ratio
    },
    "Pinterest Pin": {
        width: 1000,
        height: 1500,
        aspectRatio: "2:3" // 2:3 is valid
    },
    "Website Banner": {
        width: 1920,
        height: 600,
        aspectRatio: "16:5" // 16:5 is valid
    }
};


type ImageFormat = keyof typeof imageFormats;

const SocialShare = () => {
    const [uploadedImage, setUploadedImage] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ImageFormat>("Instagram Post");
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (uploadedImage) {
            setIsTransforming(true);
            setIsDisabled(false);
        }
    }, [uploadedImage,selectedFormat]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploading(true);
        const file = event?.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/image-upload', {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                alert('Failed to upload image');
                return;
            }
            const data = await response.json();
            setUploadedImage(data.publicId);
        } catch (error) {
            console.error(error);
            alert('Error uploading image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        if (!imageRef.current) return;

        fetch(imageRef.current.src)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            });
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Social Share</h2>
            <h3 className="text-lg mb-2">Upload your picture here:</h3>
            <form className='py-4'>
                <input
                    type="file"
                    className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                    onChange={handleImageUpload}
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff,.svg"
                />
            </form>
            {isUploading && (
                <div className='mt-4'>
                    <span className="loading loading-ring loading-xs"></span>
                    <span className="loading loading-ring loading-sm"></span>
                    <span className="loading loading-ring loading-md"></span>
                    <span className="loading loading-ring loading-lg"></span>
                </div>
            )}
            {uploadedImage && (
                <select 
                    className="select select-bordered w-full max-w-xs mt-4 mb-4"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ImageFormat)}
                >
                    {Object.keys(imageFormats).map((imageFormat, index) => (
                        <option key={index} value={imageFormat}>{imageFormat}</option>
                    ))}
                </select>
            )}
            {isTransforming && <progress className="progress w-56 mt-10 p-4"></progress>}
            {uploadedImage && selectedFormat && imageFormats[selectedFormat]  &&(
                <CldImage
                    width={imageFormats[selectedFormat].width}
                    height={imageFormats[selectedFormat].height}
                    src={uploadedImage}
                    alt={selectedFormat}
                    gravity='auto'
                    crop="fill"
                    aspectRatio={imageFormats[selectedFormat].aspectRatio}
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                    className='mt-14'
                />
            )}
            {!isTransforming && uploadedImage && (
                <button 
                    className="btn btn-primary mt-4"
                    onClick={handleDownload}
                    disabled={isDisabled}
                >
                    Download for {selectedFormat} here
                </button>
            )}
        </div>
    );
}

export default SocialShare;
