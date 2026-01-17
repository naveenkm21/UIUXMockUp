"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
    const { user } = useUser();
    return (
        <div className='flex items-center justify-between p-4'>
            <Link href={'/'}>
                <div className='flex gap-2 items-center'>
                    <Image src={'/logo.png'} alt='logo' width={40} height={40} />
                    <h2 className='text-xl font-semibold'> <span className='text-primary'>UIUX</span> MOCK</h2>
                </div>
            </Link>
            <ul className='flex gap-10 items-center text-lg'>
                <Link href={'/'}> <li className='hover:text-primary cursor-pointer'>Home</li></Link>
                <Link href={'/pricing'}> <li className='hover:text-primary cursor-pointer'>Pricing</li></Link>
            </ul>
            {!user ?
                <SignInButton mode='modal'>
                    <Button>Get Started</Button>
                </SignInButton>
                :
                <UserButton />
            }

        </div>
    )
}

export default Header