// import { PricingTable } from '@clerk/nextjs'
import React from 'react'
import Header from '../_shared/Header'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Pricing() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'For hobbyists and side projects',
            features: ['5 Projects', 'Basic AI Generation', 'Community Support', 'Standard Speed'],
            buttonVariant: 'outline'
        },
        {
            name: 'Pro',
            price: '$29',
            description: 'For professional developers',
            features: ['Unlimited Projects', 'Advanced AI Models', 'Priority Support', 'Fast Generation', 'Export to Code'],
            popular: true,
            buttonVariant: 'default'
        },
        {
            name: 'Enterprise',
            price: '$99',
            description: 'For large teams and organizations',
            features: ['Custom AI Solutions', 'Dedicated Account Manager', 'SLA Support', 'SSO & Security', 'On-premise Options'],
            buttonVariant: 'outline'
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-4 text-xl text-muted-foreground">
                        Choose the plan that best fits your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-8 bg-card border rounded-2xl shadow-sm ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mt-4 mr-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                            <p className="mt-4 flex items-baseline text-foreground">
                                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
                            </p>
                            <p className="mt-2 text-muted-foreground">{plan.description}</p>

                            <ul className="mt-6 space-y-4 flex-1">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex text-sm text-foreground">
                                        <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                        <span className="ml-3">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`mt-8 w-full ${plan.popular ? '' : ''}`}
                                variant={plan.buttonVariant as "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" | null | undefined}
                            >
                                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Pricing