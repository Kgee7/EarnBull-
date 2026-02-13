"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Award, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Goal } from "@/lib/types";

interface GoalProgressProps {
    goal: Goal;
    currentSteps: number;
}

const GoalProgress = ({ goal, currentSteps }: GoalProgressProps) => {
    const progress = goal.steps > 0 ? Math.min((currentSteps / goal.steps) * 100, 100) : 100;
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

interface DailyGoalsCardProps {
    currentSteps: number;
    onStepUpdate: (newSteps: number) => void;
    goals: Goal[];
    onGoalsUpdate: (newGoals: Goal[]) => void;
}


export function DailyGoalsCard({ currentSteps, onStepUpdate, goals, onGoalsUpdate }: DailyGoalsCardProps) {
    const maxSteps = 50000;
    const [editableGoals, setEditableGoals] = useState(goals);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        setEditableGoals(goals);
    }, [goals]);

    const handleGoalChange = (index: number, newSteps: string) => {
        const steps = parseInt(newSteps, 10);
        const sanitizedSteps = isNaN(steps) || steps < 0 ? 0 : steps;

        const newGoals = [...editableGoals];
        newGoals[index].steps = sanitizedSteps;
        newGoals[index].reward = Math.floor(sanitizedSteps / 100); // 1000 steps = 10 BC -> 100 steps = 1 BC
        setEditableGoals(newGoals);
    };

    const handleSaveChanges = () => {
        onGoalsUpdate(editableGoals);
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        setEditableGoals(goals); 
        setIsDialogOpen(false);
    }
    
    return (
        <Card className="sm:col-span-2 md:col-span-4 lg:col-span-2 xl:col-span-4">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-headline">Today's Walking Goals</CardTitle>
                    <CardDescription>Reach your daily goals to earn Bull Coins. Keep moving!</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Set Goals
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Set Your Daily Goals</DialogTitle>
                            <DialogDescription>
                                Customize your daily step targets. Rewards are automatically calculated (1 BC per 100 steps).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {editableGoals.map((goal, index) => (
                                <div key={goal.name} className="grid grid-cols-5 items-center gap-4">
                                    <Label htmlFor={`${goal.name}-steps`} className="text-right col-span-2">
                                        {goal.name} Target
                                    </Label>
                                    <Input
                                        id={`${goal.name}-steps`}
                                        type="number"
                                        value={goal.steps}
                                        onChange={(e) => handleGoalChange(index, e.target.value)}
                                        className="col-span-2"
                                        min="0"
                                    />
                                    <div className="text-sm text-muted-foreground text-center">
                                        {goal.reward} BC
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                           <DialogClose asChild>
                                <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                           </DialogClose>
                            <Button type="submit" onClick={handleSaveChanges}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                    <p className="text-sm font-medium text-muted-foreground mb-4">Simulate Activity</p>
                    <Slider
                        defaultValue={[currentSteps]}
                        value={[currentSteps]}
                        min={0}
                        max={maxSteps}
                        step={1000}
                        onValueChange={(value) => onStepUpdate(value[0])}
                    />
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => onStepUpdate(0)}>Reset Simulation</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
