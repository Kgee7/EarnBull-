"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

interface DailyGoalsCardProps {
    currentSteps: number;
    onStepUpdate: (newSteps: number) => void;
}

const goals = [
    { steps: 2000, reward: 20, name: "Bronze" },
    { steps: 5000, reward: 50, name: "Silver" },
    { steps: 10000, reward: 100, name: "Gold" },
];

const GoalProgress = ({ goal, currentSteps }: { goal: typeof goals[0], currentSteps: number }) => {
    const progress = Math.min((currentSteps / goal.steps) * 100, 100);
    const isCompleted = currentSteps >= goal.steps;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                     <Award className={`h-5 w-5 ${isCompleted ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{goal.name} Target: {goal.steps.toLocaleString()} steps</span>
                </div>
                <span className={`font-semibold text-sm ${isCompleted ? 'text-accent' : 'text-muted-foreground'}`}>
                    {isCompleted ? `+${goal.reward} BC` : `${goal.reward} BC`}
                </span>
            </div>
            <Progress value={progress} className="h-2"/>
             <p className="text-xs text-right text-muted-foreground">{Math.min(currentSteps, goal.steps).toLocaleString()} / {goal.steps.toLocaleString()}</p>
        </div>
    )
}

export function DailyGoalsCard({ currentSteps, onStepUpdate }: DailyGoalsCardProps) {
    const maxSteps = 12000;
    
    return (
        <Card className="sm:col-span-2 md:col-span-4 lg:col-span-2 xl:col-span-4">
            <CardHeader>
                <CardTitle className="font-headline">Today's Walking Goals</CardTitle>
                <CardDescription>Reach your daily goals to earn Bull Coins. Keep moving!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div className="text-center">
                    <span className="text-4xl font-bold font-headline text-primary">{currentSteps.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground"> steps today</span>
                </div>
                
                <div className="space-y-6">
                    {goals.map(goal => <GoalProgress key={goal.name} goal={goal} currentSteps={currentSteps} />)}
                </div>

                <div className="pt-6 mt-2 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Demo: Simulate Activity</p>
                    <p className="text-xs text-muted-foreground mb-4">
                        As this is a web prototype, we can't access your phone's live motion sensors. 
                        Use this slider to simulate walking and see how rewards are granted as you reach your goals.
                    </p>
                    <Slider
                        defaultValue={[currentSteps]}
                        value={[currentSteps]}
                        min={0}
                        max={maxSteps}
                        step={123}
                        onValueChange={(value) => onStepUpdate(value[0])}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
