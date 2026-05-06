"use client"
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { ChevronRight, Loader, PlaneIcon, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { suggestions, crazyIdeas } from '@/data/constant'
import IdeaBot from '@/components/IdeaBot'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { randomUUID } from "crypto";
import { toast } from 'sonner'
function Hero() {

    const [userInput, setUserInput] = useState<string>()
    const [surpriseAnim, setSurpriseAnim] = useState(false)

    const [device, setDevice] = useState<string>('mobile')

    const surpriseMe = () => {
        const lastIdea = userInput;
        let pick = crazyIdeas[Math.floor(Math.random() * crazyIdeas.length)];
        // avoid back-to-back repeat
        let tries = 0;
        while (pick.description === lastIdea && tries < 5) {
            pick = crazyIdeas[Math.floor(Math.random() * crazyIdeas.length)];
            tries++;
        }
        setUserInput(pick.description);
        setSurpriseAnim(true);
        setTimeout(() => setSurpriseAnim(false), 600);
    }

    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onCreateProject = async () => {
        if (!user) {
            router.push('/sign-in');
            return;
        }
        //Create New Project
        if (!userInput) {
            return;
        }
        setLoading(true);
        const projectId = crypto.randomUUID();
        const result = await axios.post('/api/project', {
            userInput: userInput,
            device: device,
            projectId: projectId
        })

        if (result.data?.msg == 'Limit Exceed') {
            toast.error('Already reached 2 project limit!');
            setLoading(false);
            return;
        }
        console.log(result.data);
        setLoading(false);

        //Naviagte to Project Route
        router.push('/project/' + projectId);
    }

    return (
        <div className='p-10 md:px-24 lg:px-48 xl:px-60 mt-4 flex flex-col items-center'>
            <div className='flex items-center justify-center w-full mb-5'>
                <div className="group relative max-w-sm flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                    <span
                        className={cn(
                            "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
                        )}
                        style={{
                            WebkitMask:
                                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "destination-out",
                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            maskComposite: "subtract",
                            WebkitClipPath: "padding-box",
                        }}
                    />
                    🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
                    <AnimatedGradientText className="text-sm font-medium">
                        Introducing Magic UI
                    </AnimatedGradientText>
                    <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </div>
            </div>
            <h2 className='text-5xl font-bold text-center'>Design High Quality <span className='text-primary'>Website and Mobile App</span> Designs</h2>
            <p className='text-center text-gray-600 text-lg mt-3'>From websites to mobile apps, we turn ideas into intuitive, high-impact digital experiences. ✨</p>
            {/* Surprise Me button */}
            <div className='flex justify-center mt-5 w-full'>
                <button
                    onClick={surpriseMe}
                    className={cn(
                        'group relative inline-flex items-center gap-2 px-5 py-2 rounded-full',
                        'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
                        'text-white text-sm font-medium shadow-md hover:shadow-lg',
                        'transition-all duration-200 hover:scale-105 active:scale-95',
                        surpriseAnim && 'animate-pulse'
                    )}
                >
                    <Sparkles size={16} className={surpriseAnim ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                    Surprise Me
                    <span className='text-[10px] opacity-80'>✨</span>
                </button>
            </div>

            <div className="flex mt-4 w-full  gap-6 items-center justify-center">
                <InputGroup className='max-w-xl bg-white z-10 rounded-2xl'>
                    <InputGroupTextarea
                        data-slot="input-group-control"
                        className="flex field-sizing-content min-h-24 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                        placeholder="Enter what design your want to create"
                        value={userInput}
                        onChange={(event) => setUserInput(event.target?.value)}
                    />
                    <InputGroupAddon align="block-end">

                        <Select defaultValue='mobile'
                            onValueChange={(value) => setDevice(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="mobile">Mobile</SelectItem>

                            </SelectContent>
                        </Select>
                        <InputGroupButton className="ml-auto"
                            disabled={loading}
                            size="sm" variant="default" onClick={() => onCreateProject()}>
                            {loading ? <Loader className='animate-spin' /> : <Send />}

                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>

            <div className='flex gap-3 mt-4'>
                {suggestions.map((suggestion, index) => (
                    <div key={index} className='p-2 border rounded-2xl 
                    flex flex-col items-center bg-white z-10 cursor-pointer'
                        onClick={() => setUserInput(suggestion?.description)}
                    >
                        <h2 className='text-lg'>{suggestion?.icon}</h2>
                        <h2 className='text-center line-clamp-2 text-sm'>{suggestion?.name}</h2>
                    </div>
                ))}
            </div>

            <IdeaBot onUseIdea={(prompt) => {
                setUserInput(prompt);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
        </div>
    )
}

export default Hero