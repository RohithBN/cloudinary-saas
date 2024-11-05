import { auth } from "@clerk/nextjs/server"
import { rejects } from "assert";
import { NextRequest, NextResponse } from "next/server"
import { resolve } from "path";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});



interface CloudinaryuploadResult{
    public_id:string,
    [key:string]:any
}

export async function POST(request:NextRequest){

    const {userId}=await auth();
    if(!userId){
        return NextResponse.json({
            error:"You must be logged in to upload an image"
            },{
                status:401
        })
    }
    try {

        const formData=await request.formData()
        const file=formData.get('file') as File

        if(!file)
{
    return NextResponse.json({
        error:"You must select a file to upload"
        },{
            status:400
            })

}
        const bytes=await file.arrayBuffer()
        const buffer= Buffer.from(bytes)

       const result= await new Promise<CloudinaryuploadResult>((resolve,reject)=>{
            const streamUpload=cloudinary.uploader.upload_stream({
                folder:"image-uploads",
                resource_type:"image",
            },(error,result)=>{
                if(error) reject(error)
                    else resolve(result as CloudinaryuploadResult)
            })
            streamUpload.end(buffer)
        }
    )
    return NextResponse.json({
        publicId:result.public_id,
        message:"Image Uploaded Successfully"
        },{
            status:201
        })
    
        
        
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            error:"Failed to upload image"
            },{
                status:500
                })
        
    }
    }



   
