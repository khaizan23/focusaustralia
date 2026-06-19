import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LogoutButton from "@/components/ui/logout-button";
import Link from "next/link";

export default function EmployerPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md py-5">
        <CardHeader className="text-center ">
          <div className="text-5xl mb-4">⏳</div>
          <CardTitle className="text-2xl">
            Account Pending Verification
          </CardTitle>
          <CardDescription>
            Your account is currently under review
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
            <p className="text-sm font-medium">What happens next?</p>
            <ul className="text-sm text-muted-foreground flex flex-col gap-1">
              <li>✅ Your application has been submitted</li>
              <li>⏳ Our admin team will review your account</li>
              <li>📧 You will be notified once verified</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            This process usually takes 1-2 business days.
          </p>

          {/* <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link> */}
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
