
"use client"

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

interface ProfileCardProps {
    profile: UserProfile | null;
    onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export function ProfileCard({ profile, onUpdateProfile }: ProfileCardProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState(profile?.displayName || "");
    const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for data URI storage
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Please choose an image smaller than 1MB."
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoURL(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdateProfile({
                displayName,
                photoURL
            });
            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: "There was an error saving your changes."
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Account Profile</CardTitle>
                <CardDescription>Manage your public profile and picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={photoURL} />
                            <AvatarFallback>
                                <User className="h-12 w-12 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full border shadow-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Click the camera to upload a new picture.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                            id="display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Email Address</Label>
                        <Input value={profile?.email || ""} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Your email is used for account identification.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
