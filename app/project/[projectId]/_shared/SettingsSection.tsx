"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RefreshDataContext } from '@/context/RefreshDataContext'
import { SettingContext } from '@/context/SettingContext'
import { THEME_NAME_LIST, THEMES } from '@/data/Themes'
import { ProjectType, ScreenConfig } from '@/type/types'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { Camera, Loader2Icon, Share, Sparkles } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {
    projectDetail: ProjectType | undefined,
    screenDescription?: string | undefined,
    takeScreenshot: any,
    screenConfig: ScreenConfig[]
}

function SettingsSection({ projectDetail, screenDescription, takeScreenshot, screenConfig }: Props) {

    const [selectedTheme, setSelectedTheme] = useState('NETFLIX');
    const [projectName, setProjectName] = useState<string>();
    const [userNewScreenInput, setUserNewScreenInput] = useState<string>()
    const { settingsDetail, setSettingDetail } = useContext(SettingContext);
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('Loading..');

    const { refreshData, setRefreshData } = useContext(RefreshDataContext);
    const { has } = useAuth();
    const hasPremiumAccess = has && has({ plan: 'unlimted' })

    useEffect(() => {
        projectDetail && setProjectName(projectDetail?.projectName);
        setSelectedTheme(projectDetail?.theme as string)
    }, [projectDetail])

    const onThemeSelect = (theme: string) => {
        console.log(theme)
        setSelectedTheme(theme);
        setSettingDetail((prev: any) => ({
            ...prev,
            theme: theme
        }))
    }

    const GenerateNewScreen = async () => {

        if (!hasPremiumAccess) {
            toast.error('Limited feature to paid users only')
            return;
        }

        try {
            setLoading(true);
            const result = await axios.post('/api/generate-config', {
                projectId: projectDetail?.projectId,
                projectName: projectDetail?.projectName,
                deviceType: projectDetail?.device,
                theme: projectDetail?.theme,
                oldScreenDescription: screenDescription
            });
            console.log(result.data);
            setRefreshData({ method: 'screenConfig', date: Date.now() })
            setLoading(false);
        }
        catch (e) {
            setLoading(false);
        }
    }

    return (
        <div className='w-[300px]  h-[90vh] p-5 border-r'>
            <h2 className='font-medium text-lg'>Settings</h2>
            {loading &&
                <div className='p-3 absolute bg-blue-300/20 z-10
                     border-blue-400 border rounded-xl left-1/2 top-20' >
                    <h2 className='flex gap-2 items-center'>
                        <Loader2Icon className='animate-spin' /> {loadingMsg}</h2>
                </div>}

            <div className='mt-3'>
                <h2 className='text-sm mb-1'>Project Name</h2>
                <Input placeholder='Project Name'
                    value={projectName || ''}
                    onChange={(event) => {
                        setProjectName(event.target.value)
                        setSettingDetail((prev: any) => ({
                            ...prev,
                            projectName: event.target.value
                        }))
                    }}
                />
            </div>
            <div className='mt-5'>
                <h2 className='text-sm mb-1'>Generate New Screen</h2>
                <Textarea placeholder='Enter Prompt to generate screen using AI'
                    onChange={(event) => setUserNewScreenInput(event.target.value)}
                />
                <Button size={'sm'}
                    disabled={loading}
                    className='mt-2 w-full' onClick={GenerateNewScreen}>
                    {loading ? <Loader2Icon className='animate-spin' /> :
                        <Sparkles />} Generate With AI</Button>
            </div>

            <div className='mt-5'>
                <h2 className='text-sm mb-1'>Themes</h2>
                <div className='h-[200px] overflow-auto'>
                    <div>
                        {THEME_NAME_LIST.map((theme, index) => (
                            <div key={index} className={`p-3  border rounded-xl mb-2
                                ${theme == selectedTheme && 'border-primary bg-primary/20'}
                                `}
                                onClick={() => onThemeSelect(theme)}>
                                <h2>{theme}</h2>
                                <div className='flex gap-2'>
                                    <div className={`h-4 w-4  rounded-full`}
                                        style={{ background: THEMES[theme].primary }}
                                    />
                                    <div className={`h-4 w-4 rounded-full`}
                                        style={{ background: THEMES[theme].secondary }}
                                    />
                                    <div className={`h-4 w-4 rounded-full`}
                                        style={{ background: THEMES[theme].accent }}
                                    />
                                    <div className={`h-4 w-4 rounded-full`}
                                        style={{ background: THEMES[theme].background }}
                                    />
                                    <div
                                        className="h-4 w-4 rounded-full"
                                        style={{
                                            background: `linear-gradient(
                                            135deg,
                                            ${THEMES[theme].background},
                                            ${THEMES[theme].primary},
                                            ${THEMES[theme].accent}
                                        )`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='mt-5'>
                <h2 className='text-sm mb-1'>Extras</h2>
                <div className='flex gap-3'>
                    <Button size={'sm'} variant={'outline'} className='mt-2 ' onClick={() => takeScreenshot()}> <Camera /> Screenshot</Button>
                    <Button size={'sm'} variant={'outline'} className='mt-2 '> <Share /> Share</Button>
                </div>
            </div>
        </div>
    )
}

export default SettingsSection