import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({
            error: "You must be logged in to upload a video."
        }, {
            status: 401
        });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
        return NextResponse.json({
            error: "Cloudinary API keys are not set."
        }, {
            status: 500
        });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const originalSize = formData.get('originalSize') as string;

        if (!file) {
            return NextResponse.json({
                error: "You must select a file to upload."
            }, {
                status: 400
            });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const streamUpload = cloudinary.uploader.upload_stream({
                folder: "video-uploads", 
                resource_type: "video",
                transformation: [
                    {
                        quality: "auto",
                        fetch_format: "mp4",
                    }
                ]
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
            });

            streamUpload.end(buffer);
        });

        const videos = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration ?? 0 // Ensure a default value if duration is undefined
            }
        });

        return NextResponse.json({
            publicId: result.public_id,
            message: "Video uploaded successfully."
        }, {
            status: 201
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to upload video."
        }, {
            status: 500
        });
    }
}
