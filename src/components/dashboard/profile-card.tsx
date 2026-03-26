
"use client"

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

interface ProfileCardProps {
    profile: UserProfile | null;
    onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    onResetProfile?: () => Promise<void>;
}

export function ProfileCard({ profile, onUpdateProfile, onResetProfile }: ProfileCardProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [displayName, setDisplayName] = useState(profile?.displayName || "");
    const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName);
            setPhotoURL(profile.photoURL || "");
        }
    }, [profile]);

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

    const handleReset = async () => {
        if (!onResetProfile) return;
        setIsResetting(true);
        try {
            await onResetProfile();
            toast({
                title: "Profile reset",
                description: "Your profile information has been restored to defaults."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Reset failed",
                description: "Could not reset profile information."
            });
        } finally {
            setIsResetting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Profile Settings</CardTitle>
                <CardDescription>Update your display name and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-28 w-28">
                            <AvatarImage src={photoURL} className="object-cover" />
                            <AvatarFallback>
                                <User className="h-14 w-14 text-muted-foreground" />
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
                    <p className="text-xs text-muted-foreground text-center">
                        Upload a new profile picture. Recommended size: 500x500px.
                    </p>
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
                        <Input value={profile?.email || ""} disabled className="bg-muted cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground italic">Your email address is managed by your account provider.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleSave} disabled={isSaving || isResetting}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                {onResetProfile && (
                    <Button variant="outline" className="w-full" onClick={handleReset} disabled={isSaving || isResetting}>
                        {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                        Reset to Defaults
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
