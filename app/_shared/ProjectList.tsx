"use client"
import { ProjectType } from '@/type/types'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectList() {

    const [projectList, setProjectList] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        GetProjectList();
    }, [])

    const GetProjectList = async () => {
        setLoading(true);
        try {
            const result = await axios.get('/api/project');
            console.log('API Response:', result.data);
            // Ensure we always set an array
            setProjectList(Array.isArray(result?.data) ? result.data : []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjectList([]);
        }
        setLoading(false);
    }

    return (
        <div className='px-10 md:px-24 lg:px-44 xl:px-56'>
            <h2 className='font-bold text-xl'>My Projects</h2>

            {!loading && projectList?.length == 0 && <div className='p-6 border border-dashed rounded-3xl'>
                <h2 className='text-center'>No Project Available</h2>
            </div>}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5'>
                {!loading ? projectList?.map((project, index) => (

                    <ProjectCard project={project} key={index} />

                )) :
                    [1, 2, 3, 4, 5].map((item, index) => (
                        <div key={index}>
                            <Skeleton className='w-full h-[200px] rounded-2xl' />
                            <Skeleton className='mt-3 w-full h-6' />
                            <Skeleton className='mt-3 w-30 h-3' />

                        </div>
                    ))
                }
            </div>

        </div>
    )
}

export default ProjectList