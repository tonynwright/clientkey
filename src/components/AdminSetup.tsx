import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function AdminSetup() {
  const { toast } = useToast();
  const { user } = useAuth();

  const sqlCommand = `-- Run this in your backend SQL editor to make this user an admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('${user?.id || 'YOUR_USER_ID'}', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "SQL command copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Account Setup
        </CardTitle>
        <CardDescription>
          Create an admin account with unlimited access and user management capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Your User ID:</strong>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                {user?.id || "Not logged in"}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(user?.id || "")}
                disabled={!user}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <p className="font-semibold">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Copy the SQL command below</li>
            <li>Open your backend database</li>
            <li>Navigate to the SQL Editor</li>
            <li>Paste and run the command</li>
            <li>Refresh this page to see admin privileges</li>
          </ol>
        </div>

        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <strong>SQL Command:</strong>
              <div className="flex items-start gap-2 mt-2">
                <code className="flex-1 p-3 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                  {sqlCommand}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(sqlCommand)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-primary">
          <AlertDescription className="text-xs">
            💡 <strong>Admin Benefits:</strong>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Unlimited client access (no 3 or 300 limit)</li>
              <li>Access to all admin features</li>
              <li>User management capabilities (coming soon)</li>
              <li>No subscription required</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button
          variant="default"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Refresh to Check Admin Status
        </Button>
      </CardContent>
    </Card>
  );
}
