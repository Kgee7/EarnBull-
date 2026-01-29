"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface StepSimulatorProps {
    currentSteps: number;
    onStepUpdate: (newSteps: number) => void;
}

export function StepSimulator({ currentSteps, onStepUpdate }: StepSimulatorProps) {
    const maxSteps = currentSteps + 20000;
    
    return (
        <Card className="sm:col-span-2 md:col-span-4 lg:col-span-2 xl:col-span-4">
            <CardHeader>
                <CardTitle className="font-headline">Simulate Walking</CardTitle>
                <CardDescription>Drag the slider to simulate walking and earn Bull Coins.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="text-center">
                    <span className="text-4xl font-bold font-headline text-primary">{currentSteps.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground"> / {maxSteps.toLocaleString()} steps</span>
                </div>
                <Slider
                    defaultValue={[currentSteps]}
                    value={[currentSteps]}
                    min={0}
                    max={maxSteps}
                    step={123} // Update more smoothly
                    onValueChange={(value) => onStepUpdate(value[0])}
                />
            </CardContent>
        </Card>
    )
}
