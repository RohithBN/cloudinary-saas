import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'


const page = () => {
    const [file,setFile]=useState<File | null>(null);
    const[isUploading,setIsUploading]=useState(false)
    const[title,setTitle]=useState('')
    const[description,setDescription]=useState('')

    const router=useRouter();
    const MAX_SIZE=60*1024*1024;
    
    const handleMaxSize=()=>{
        if(!file){
            return;
        }
        if(file?.size>MAX_SIZE){
            alert('File size is too large')
            return;
        }
    }

    const handleSubmit=async(event:React.FormEvent)=>{
        event.preventDefault();
        if(!file){
            alert('Please select a file')
            return;
        }
        handleMaxSize();
        if(!title || !description){
            alert('Please fill in all fields')
    }
        const formData=new FormData();
        formData.append('file',file);
        formData.append('title',title);
        formData.append('description',description);
        formData.append('originalSize',file?.size.toString())
        setIsUploading(true)
       try {
         const response=await axios.post('/api/video-upload',formData)
         console.log(response.data)
         router.push('/video')
       } catch (error) {
        console.error(error)
        }finally{
            setIsUploading(false)
        }
       }


  return (
    <div>
        <h2>Upload the video here:</h2>
        <form onSubmit={handleSubmit}>
            Title:<input type="text" 
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            />
        </form>
    </div>
  )
}

export default page