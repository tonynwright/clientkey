import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function StripeWebhookSetup() {
  const { toast } = useToast();
  const webhookUrl = `${window.location.origin.replace('https://', 'https://sxrfrzkzuiuxzktctxya.supabase.co')}/functions/v1/stripe-webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Webhook Configuration</CardTitle>
        <CardDescription>
          Complete these steps to enable automatic subscription syncing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Webhook URL:</strong>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <p className="font-semibold">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Go to your{" "}
              <a
                href="https://dashboard.stripe.com/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Stripe Dashboard → Webhooks
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Click "Add endpoint"</li>
            <li>Paste the webhook URL above</li>
            <li>
              Select these events:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>checkout.session.completed</li>
                <li>customer.subscription.updated</li>
                <li>customer.subscription.deleted</li>
                <li>invoice.payment_succeeded</li>
                <li>invoice.payment_failed</li>
              </ul>
            </li>
            <li>Click "Add endpoint"</li>
            <li>
              Copy the "Signing secret" and add it as <code>STRIPE_WEBHOOK_SECRET</code> in your
              Lovable secrets
            </li>
          </ol>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            💡 <strong>Tip:</strong> You can test webhooks locally using the Stripe CLI with{" "}
            <code>stripe listen --forward-to {webhookUrl}</code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
