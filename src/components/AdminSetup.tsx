import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSetup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Access
        </CardTitle>
        <CardDescription>
          Need unlimited client access or admin privileges?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-muted">
          <AlertDescription className="text-sm">
            <p className="mb-3">
              Admin accounts have unlimited client access and special capabilities for managing the platform.
            </p>
            <p className="text-muted-foreground">
              To request admin access, please contact support.
            </p>
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = 'mailto:support@clientkey.com?subject=Admin Access Request'}
        >
          Contact Support
        </Button>
      </CardContent>
    </Card>
  );
}
