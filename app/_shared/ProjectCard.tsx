import { Skeleton } from '@/components/ui/skeleton'
import { ProjectType } from '@/type/types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
    project: ProjectType
}
function ProjectCard({ project }: Props) {
    return (
        <Link href={'/project/' + project?.projectId}>
            <div className=' rounded-2xl p-4 '>
                {project?.screenshot ?
                    <Image src={project?.screenshot} alt={project?.projectName || ''}
                        width={300}
                        height={200}
                        className='rounded-xl object-contain h-[200px] w-full bg-black'
                    /> :
                    <div className='w-full h-[200px] rounded-xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center p-4'>
                        <h2 className='text-white font-bold text-2xl text-center capitalize'>{project.projectName}</h2>
                    </div>
                }
                <div className='p-2'>
                    <h2>{project?.projectName}</h2>
                    <p className='text-sm text-gray-500'>{project.createdOn}</p>
                </div>
            </div>
        </Link>
    )
}

export default ProjectCard