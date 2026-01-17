"use client"
import React, { useContext, useEffect, useState } from 'react'
import ProjectHeader from './_shared/ProjectHeader'
import SettingsSection from './_shared/SettingsSection'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { ProjectType, ScreenConfig } from '@/type/types'
import { Loader2Icon } from 'lucide-react'
import Canvas from './_shared/Canvas'
import { SettingContext } from '@/context/SettingContext'
import { RefreshDataContext } from '@/context/RefreshDataContext'

function ProjectCanvasPlayground() {

    const { projectId } = useParams();
    const [projectDetail, setProjectDetail] = useState<ProjectType>();
    const [screenConfigOriginal, setScreenConfigOriginal] = useState<ScreenConfig[]>([]);
    const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
    const { settingsDetail, setSettingDetail } = useContext(SettingContext);
    const [loading, setLoading] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState('Loading');
    const { refreshData, setRefreshData } = useContext(RefreshDataContext);
    const [takeScreenshot, setTakeScreenshot] = useState<any>();
    const [generating, setGenerating] = useState(false);
    useEffect(() => {
        projectId && GetProjectDetail();
    }, [projectId])

    useEffect(() => {
        if (refreshData?.method == 'screenConfig') {
            GetProjectDetail();
        }

    }, [refreshData])

    const GetProjectDetail = async () => {
        setLoading(true);
        setLoadingMsg('Loading...')
        const result = await axios.get('/api/project?projectId=' + projectId)
        console.log(result.data);
        setProjectDetail(result?.data?.projectDetail);
        setScreenConfigOriginal(result?.data?.screenConfig)
        setScreenConfig(result?.data?.screenConfig)
        setSettingDetail(result?.data?.projectDetail);
        setLoading(false);
    }

    useEffect(() => {
        if (projectDetail && screenConfigOriginal.length == 0) {
            generateScreenConfig();
        }
        else if (projectDetail && screenConfigOriginal) {
            console.log("EXCE")
            GenerateScreenUIUX();
        }

    }, [screenConfigOriginal])

    const generateScreenConfig = async () => {
        setLoading(true);
        setLoadingMsg('Generating Screen Config...');
        const result = await axios.post('/api/generate-config', {
            projectId: projectId,
            deviceType: projectDetail?.device,
            userInput: projectDetail?.userInput
        })

        console.log(result.data);

        // Update state directly from response to handle Mock/RateLimit cases where DB isn't updated
        if (result.data?.screens && Array.isArray(result.data.screens)) {
            setScreenConfig(result.data.screens);
            setScreenConfigOriginal(result.data.screens);
            setProjectDetail(prev => ({
                ...prev!,
                projectName: result.data.projectName,
                projectVisualDescription: result.data.projectVisualDescription,
                theme: result.data.theme
            }));
        } else {
            // Fallback to fetch from DB if response structure is unexpected
            GetProjectDetail();
        }

        setLoading(false);
    }

    const GenerateScreenUIUX = async () => {
        setLoading(true);
        for (let index = 0; index < screenConfig?.length; index++) {
            const screen = screenConfig[index];
            if (screen?.code) continue;
            setLoadingMsg('Generating Screen ' + (index + 1))

            const result = await axios.post('/api/generate-screen-ui', {
                projectId,
                screenId: screen?.screenId,
                screenName: screen?.screenName,
                purpose: screen?.purpose,
                screenDescription: screen?.screenDescription
            });

            setScreenConfig(prev => prev.map((item, i) =>
                (i === index ? result.data : item)))
        }
        setLoading(false);
        setTakeScreenshot(1);
    }

    return (
        <div>
            <ProjectHeader />
            <div className='flex '>
                {loading &&
                    <div className='p-3 absolute bg-blue-300/20 z-10
                     border-blue-400 border rounded-xl left-1/2 top-20' >
                        <h2 className='flex gap-2 items-center'>
                            <Loader2Icon className='animate-spin' /> {loadingMsg}</h2>
                    </div>}

                {/* Settings  */}
                <SettingsSection projectDetail={projectDetail}
                    //  @ts-ignore 
                    screenDescription={screenConfig[0]?.screenDescription}
                    takeScreenshot={() => setTakeScreenshot(Date.now())}
                    screenConfig={screenConfig}
                />

                {/* Canvas  */}
                <Canvas projectDetail={projectDetail}
                    screenConfig={screenConfig}
                    takeScreenshot={takeScreenshot}

                />
            </div>
        </div>
    )
}

export default ProjectCanvasPlayground