import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LogoutButton from "@/components/ui/logout-button";

export default function EmployerDeactivatedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <CardTitle className="text-2xl">Account Deactivated</CardTitle>
          <CardDescription>
            Your employer account has been deactivated
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
            <p className="text-sm font-medium">What does this mean?</p>
            <ul className="text-sm text-muted-foreground flex flex-col gap-1">
              <li>🔒 Your account has been temporarily deactivated</li>
              <li>📧 Please contact our admin team for assistance</li>
              <li>✅ Your account can be reactivated by an admin</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            For assistance, please contact{" "}
            <span className="text-primary font-medium">
              itsupport@focusaustralia.ph
            </span>
          </p>

          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
