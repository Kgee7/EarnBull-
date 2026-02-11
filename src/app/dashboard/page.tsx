'use client';
import { MainDashboard } from "@/components/dashboard/main-dashboard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/firebase";

export default function DashboardPage() {
  const { user } = useUser();
  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div>
            <CardTitle className="font-headline text-2xl">Let's get moving!</CardTitle>
            <CardDescription>Welcome back, {user?.displayName || 'user'}! Your dashboard is ready.</CardDescription>
          </div>
        </CardHeader>
      </Card>
      <MainDashboard />
    </>
  );
}
