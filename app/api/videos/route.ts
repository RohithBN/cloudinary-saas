import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma=new PrismaClient();

export async function GET(request:NextRequest){
    try {
        const videos=await prisma.video.findMany({
            orderBy:{
                createdAt:"desc"
            }
        })
        return NextResponse.json({
            success:"true",
            message:"Videos retreived successfully",
            videos
        },{
                status:200
        });
        
    } catch (error) {
        return NextResponse.json({
            success:"false",
            message:"Error retreiving videos",
        },
    {
        status:500
    })
        
    }
}