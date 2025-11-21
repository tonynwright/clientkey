import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Video, Youtube, ExternalLink } from "lucide-react";

export const VideoUploadGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Adding Tutorial Videos
        </CardTitle>
        <CardDescription>
          How to add your own screen recording videos to the tutorial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The tutorial is ready to accept video URLs. Follow these steps to add your screen recordings.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Record Your Screen
            </h4>
            <p className="text-sm text-muted-foreground ml-8">
              Use screen recording software like:
            </p>
            <ul className="text-sm text-muted-foreground ml-12 mt-2 space-y-1">
              <li>• Loom (easiest for quick videos)</li>
              <li>• OBS Studio (free, professional)</li>
              <li>• macOS QuickTime (built-in for Mac)</li>
              <li>• Windows Game Bar (built-in for Windows)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Upload to YouTube
            </h4>
            <p className="text-sm text-muted-foreground ml-8">
              Upload your videos to YouTube (can be unlisted if you want them private but embeddable).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Get the Embed URL
            </h4>
            <p className="text-sm text-muted-foreground ml-8 mb-2">
              On YouTube, click "Share" → "Embed" and copy the URL from the iframe src attribute. It should look like:
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded ml-8 block w-fit">
              https://www.youtube.com/embed/VIDEO_ID
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Add URLs to Code
            </h4>
            <p className="text-sm text-muted-foreground ml-8">
              Open <code className="text-xs bg-muted px-1 py-0.5 rounded">src/components/ComprehensiveTutorial.tsx</code> and replace the empty <code className="text-xs bg-muted px-1 py-0.5 rounded">videoUrl</code> strings with your YouTube embed URLs.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <h5 className="font-semibold text-sm mb-2">Video Recommendations:</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Keep videos under 2 minutes each</li>
              <li>• Show the actual feature being used</li>
              <li>• Use clear narration explaining each step</li>
              <li>• Test embed URLs before deploying</li>
              <li>• Consider adding captions for accessibility</li>
            </ul>
          </div>

          <Alert className="border-primary/50 bg-primary/5">
            <Youtube className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Create a dedicated YouTube channel for your ClientKey tutorials. This makes it easy to organize all videos in one place and update them as features evolve.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};