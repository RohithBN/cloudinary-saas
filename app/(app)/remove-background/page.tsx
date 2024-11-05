'use client';
import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react';

const SocialShare = () => {
    const [uploadedImage, setUploadedImage] = useState<string>('');
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isTransforming, setIsTransforming] = useState<boolean>(false);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (uploadedImage) {
            setIsTransforming(true);
            setIsDisabled(false);
        }
    }, [uploadedImage]);

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
                link.download = `background-removed.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            });
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Background Removal</h2>
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
            
            {isTransforming && <progress className="progress w-56 mt-10"></progress>}
            {uploadedImage && (
                <CldImage
                    width={500} // Ensure this width is valid and under 25MP limit
                    height={500} // Ensure this height is valid and under 25MP limit
                    src={uploadedImage}
                    crop="fill"
                    gravity="auto"
                    removeBackground
                    sizes="100vw"
                    alt="Background removed image"
                    onLoad={() => setIsTransforming(false)}
                    ref={imageRef}
                />
            )}
            {!isTransforming && uploadedImage && (
                <button 
                    className="btn btn-primary mt-4"
                    onClick={handleDownload}
                    disabled={isDisabled}
                >
                    Download here!
                </button>
            )}
        </div>
    );
}

export default SocialShare;
