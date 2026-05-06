import { Button } from '@/components/ui/button'
import { SettingContext } from '@/context/SettingContext';
import axios from 'axios';
import { Loader2, Save } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link';
import React, { useContext, useState } from 'react'
import { toast } from 'sonner';

function ProjectHeader() {
    const { settingsDetail, setSettingDetail } = useContext(SettingContext);
    const [loading, setLoading] = useState(false);

    const OnSave = async () => {
        try {
            setLoading(true);
            const result = await axios.put('/api/project', {
                theme: settingsDetail?.theme,
                projectId: settingsDetail?.projectId,
                projectName: settingsDetail?.projectName
            })
            setLoading(false);
            toast.success('Setting Saved!')
        }
        catch (e) {
            setLoading(false);
            toast.error('Internal Server Error')

        }
    }


    return (
        <div className='flex items-center justify-between p-3 shadow'>
            <Link href={'/'}>
                <div className='flex gap-2 items-center'>
                    <Image src={'/logo.png'} alt='logo' width={40} height={40} />
                    <h2 className='text-xl font-semibold'> <span className='text-primary'>UIUX</span> MOCK</h2>
                </div>
            </Link>
            <Button onClick={OnSave} disabled={loading}> {loading ? <Loader2 className='animate-spin' /> : <Save />} Save</Button>
        </div>
    )
}

export default ProjectHeader