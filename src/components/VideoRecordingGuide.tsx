import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Video, Mic, Monitor } from "lucide-react";

export const VideoRecordingGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Recording Guide
        </CardTitle>
        <CardDescription>
          Checklists and script templates for recording professional tutorial videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre-Recording Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Pre-Recording Checklist</h4>
          <div className="grid gap-2">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Screen Resolution:</strong> Set to 1920x1080 or 1280x720 for best quality
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Browser Zoom:</strong> Set to 100% (or 90% if UI elements are too large)
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Close Distractions:</strong> Close unnecessary tabs, notifications, and apps
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Mic className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Audio Setup:</strong> Use a quality microphone in a quiet environment
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Monitor className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Demo Data:</strong> Have clean, realistic demo data ready (not test123/lorem ipsum)
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <strong>Recording Software:</strong> Test your recording software before starting
              </div>
            </div>
          </div>
        </div>

        {/* Recording Tips */}
        <Alert>
          <Video className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tips:</strong> Keep videos under 90 seconds. Speak clearly and at a moderate pace. Show, don't just tell - demonstrate each feature in action.
          </AlertDescription>
        </Alert>

        {/* Script Templates */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Script Templates</h4>
          <Accordion type="single" collapsible className="w-full">
            
            {/* Step 1 */}
            <AccordionItem value="step-1">
              <AccordionTrigger>Step 1: Welcome & Overview</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Welcome to ClientKey! I'm excited to show you how this platform will transform the way you understand and communicate with your clients."</p>
                  
                  <p className="font-semibold mt-3">Key Points to Cover:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>DISC personality profiling helps you understand client communication styles</li>
                    <li>Get personalized communication strategies for each client</li>
                    <li>Build stronger relationships and improve client retention</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Show the main dashboard with client cards</li>
                    <li>Hover over different sections to preview features</li>
                    <li>Briefly scroll through the navigation menu</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Closing:</p>
                  <p>"Let's start by understanding what DISC is and how it works."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2 */}
            <AccordionItem value="step-2">
              <AccordionTrigger>Step 2: DISC Assessment Basics</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"DISC is a proven personality framework used by thousands of businesses to improve communication. Let me show you the four types."</p>
                  
                  <p className="font-semibold mt-3">Key Points to Cover:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>D (Dominance):</strong> Direct, results-oriented, decisive</li>
                    <li><strong>I (Influence):</strong> Enthusiastic, optimistic, outgoing</li>
                    <li><strong>S (Steadiness):</strong> Patient, team-oriented, reliable</li>
                    <li><strong>C (Conscientiousness):</strong> Analytical, precise, systematic</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Show examples of DISC type badges/colors</li>
                    <li>Display the DISC type descriptions</li>
                    <li>Show how scores are visualized (if applicable)</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Closing:</p>
                  <p>"Understanding these types is the foundation for better client communication. Next, let's add your first client."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3 */}
            <AccordionItem value="step-3">
              <AccordionTrigger>Step 3: Adding Your First Client</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Adding a client is quick and easy. You only need their basic information to get started."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions (Step-by-Step):</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Click the "Add New Client" button</li>
                    <li>Fill in client name: "Sarah Johnson"</li>
                    <li>Add email: "sarah@example.com"</li>
                    <li>Add company: "Acme Corporation"</li>
                    <li>Click "Create Client"</li>
                    <li>Show the new client card appearing in the dashboard</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration During Actions:</p>
                  <p>"Just enter their name, email, and company. That's it - your client is added. Now we need to get their DISC profile by sending them an assessment."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4 */}
            <AccordionItem value="step-4">
              <AccordionTrigger>Step 4: Sending Assessment Invitations</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Now let's send Sarah the DISC assessment. Your clients will receive a professional email with a direct link to complete their profile."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Find Sarah's client card</li>
                    <li>Click the "Send Assessment" button</li>
                    <li>Show the email preview/template (if visible)</li>
                    <li>Click "Send"</li>
                    <li>Show success confirmation</li>
                    <li>Point out the email tracking status ("Sent")</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Key Points:</p>
                  <p>"The assessment takes about 5 minutes to complete. Clients answer 24 quick questions, and their results are automatically saved to your dashboard. You'll get notified when they finish."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 5 */}
            <AccordionItem value="step-5">
              <AccordionTrigger>Step 5: Understanding DISC Types</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Once a client completes their assessment, you'll see their DISC type displayed prominently on their profile. Let me show you what this looks like."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Open a client profile with completed assessment</li>
                    <li>Highlight the DISC type badge (e.g., "D - Dominance")</li>
                    <li>Show the score breakdown visualization</li>
                    <li>Scroll through the type description</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"Here you can see their dominant type and their scores across all four dimensions. These scores give you deeper insight into their personality blend. Most people are a mix of types, not just one."</p>
                  
                  <p className="font-semibold mt-3">Closing:</p>
                  <p>"Now that you understand their type, let's see how to communicate effectively with them."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 6 */}
            <AccordionItem value="step-6">
              <AccordionTrigger>Step 6: Communication Playbooks</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"This is where ClientKey becomes powerful. Each DISC type responds best to different communication styles. We provide you with detailed playbooks for every interaction."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Navigate to the Communication Playbook section</li>
                    <li>Show the playbook for the client's type</li>
                    <li>Scroll through different sections (emails, meetings, presentations)</li>
                    <li>Highlight specific do's and don'ts</li>
                    <li>Show example phrases or templates</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Key Point:</p>
                  <p>"For a D-type client, be direct and results-focused. For an I-type, be enthusiastic and social. For an S-type, be patient and supportive. And for a C-type, be detailed and data-driven. These playbooks give you the exact strategies you need."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 7 */}
            <AccordionItem value="step-7">
              <AccordionTrigger>Step 7: Staff Management (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"With the Pro plan, you can also profile your team members. This helps you assign the right staff to the right clients for maximum compatibility."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Navigate to Staff Management</li>
                    <li>Click "Add Staff Member"</li>
                    <li>Fill in staff details and DISC type</li>
                    <li>Show the staff directory with all team members</li>
                    <li>Display DISC type distribution across team</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"Add your entire team and their DISC profiles. This sets the foundation for our next feature - intelligent staff-client matching."</p>
                  
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded mt-3">
                    <p className="text-xs font-semibold text-primary">PRO FEATURE HIGHLIGHT</p>
                    <p className="text-xs mt-1">"This feature is available on the Pro plan, which also includes AI insights, advanced analytics, and unlimited clients."</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 8 */}
            <AccordionItem value="step-8">
              <AccordionTrigger>Step 8: Staff-Client Matching (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Here's where it gets really interesting. Our compatibility matching shows you which team members will work best with which clients based on personality compatibility."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Navigate to Staff-Client Matching</li>
                    <li>Select a client from the dropdown</li>
                    <li>Show compatibility scores for each staff member</li>
                    <li>Highlight the highest compatibility match</li>
                    <li>Open detailed compatibility insights</li>
                    <li>Show strengths, challenges, and recommendations</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"You can instantly see compatibility percentages. High D clients work well with C-type staff who provide structure. High I clients connect better with S-type staff who are supportive. The system explains exactly why each pairing works and what to watch out for."</p>
                  
                  <p className="font-semibold mt-3">Value Proposition:</p>
                  <p>"This feature alone can prevent client churn by ensuring personality alignment from day one."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 9 */}
            <AccordionItem value="step-9">
              <AccordionTrigger>Step 9: AI-Powered Insights (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Beyond the standard playbooks, Pro users get AI-generated insights tailored to each specific client's personality blend."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Open a client profile</li>
                    <li>Click "Generate AI Insights"</li>
                    <li>Show loading state (if quick)</li>
                    <li>Display the generated insights</li>
                    <li>Scroll through different insight sections</li>
                    <li>Highlight specific, actionable recommendations</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"The AI analyzes their complete score profile - not just their dominant type - and generates customized communication strategies, potential friction points, motivation factors, and decision-making preferences. These insights are saved to the client's profile for easy reference."</p>
                  
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded mt-3">
                    <p className="text-xs font-semibold text-primary">PRO FEATURE HIGHLIGHT</p>
                    <p className="text-xs mt-1">"AI insights go far beyond basic type descriptions to give you truly personalized strategies."</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 10 */}
            <AccordionItem value="step-10">
              <AccordionTrigger>Step 10: Email Templates & Automation (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Pro users can customize their assessment invitation emails and set up automated reminder sequences."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Navigate to Email Templates</li>
                    <li>Show the invitation template editor</li>
                    <li>Edit subject line and email body</li>
                    <li>Add custom branding/logo</li>
                    <li>Preview the email</li>
                    <li>Navigate to Reminder Settings</li>
                    <li>Configure reminder frequency (3, 5, or 7 days)</li>
                    <li>Set maximum reminders (1-5)</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"Customize every aspect of your assessment emails to match your brand. Then set up automatic reminders for clients who haven't completed their assessment. The system handles follow-up automatically so you don't have to."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 11 */}
            <AccordionItem value="step-11">
              <AccordionTrigger>Step 11: Email Analytics (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Track the performance of your assessment campaigns with detailed email analytics."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Navigate to Email Analytics dashboard</li>
                    <li>Show total emails sent counter</li>
                    <li>Display open rate percentage</li>
                    <li>Show click-through rate</li>
                    <li>Display completion rate</li>
                    <li>Scroll through individual client tracking status</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"See exactly how many clients have opened your emails, clicked the assessment link, and completed their profile. This data helps you optimize your outreach strategy and identify clients who need a personal follow-up call."</p>
                  
                  <p className="font-semibold mt-3">Key Insight:</p>
                  <p>"If you see high open rates but low completion rates, you might need to adjust your email copy or follow up personally with those clients."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 12 */}
            <AccordionItem value="step-12">
              <AccordionTrigger>Step 12: PDF Reports & Exports (Pro)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Opening:</p>
                  <p>"Finally, Pro users can export professional PDF reports to share with clients or team members."</p>
                  
                  <p className="font-semibold mt-3">Visual Actions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Open a client profile</li>
                    <li>Click "Export PDF" or similar button</li>
                    <li>Show the PDF generation process</li>
                    <li>Display the generated PDF preview</li>
                    <li>Scroll through different sections of the PDF</li>
                    <li>Show compatibility report option (if available)</li>
                  </ul>
                  
                  <p className="font-semibold mt-3">Narration:</p>
                  <p>"Generate beautiful, branded PDF reports that include the client's DISC profile, communication strategies, and AI insights. These reports are perfect for client meetings, team briefings, or as deliverables that demonstrate your professionalism and expertise."</p>
                  
                  <p className="font-semibold mt-3">Closing:</p>
                  <p>"That's ClientKey - a complete solution for understanding and communicating with your clients based on personality science. Ready to transform your client relationships? Click 'Get Started' to begin your journey."</p>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        {/* Post-Recording Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h5 className="font-semibold text-sm mb-2">Post-Recording Checklist</h5>
          <ul className="text-sm space-y-1">
            <li>✓ Watch the entire video to check for mistakes</li>
            <li>✓ Verify audio quality and volume levels</li>
            <li>✓ Ensure all UI elements are clearly visible</li>
            <li>✓ Check that mouse movements aren't too fast</li>
            <li>✓ Confirm video length is under 2 minutes</li>
            <li>✓ Add captions/subtitles if possible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
