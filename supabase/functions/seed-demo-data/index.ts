import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoClient {
  name: string;
  email: string;
  company: string;
  disc_type: string;
  disc_scores: { D: number; I: number; S: number; C: number };
}

interface DemoStaff {
  name: string;
  email: string;
  role: string;
  disc_type: string;
  disc_scores: { D: number; I: number; S: number; C: number };
}

const demoStaff: DemoStaff[] = [
  // Account Managers - mix of types
  { name: "Alex Thompson", email: "alex.t@agency.com", role: "Senior Account Manager", disc_type: "I", disc_scores: { D: 22, I: 35, S: 20, C: 11 } },
  { name: "Jordan Lee", email: "jordan.l@agency.com", role: "Account Manager", disc_type: "S", disc_scores: { D: 14, I: 20, S: 38, C: 16 } },
  { name: "Morgan Davis", email: "morgan.d@agency.com", role: "Account Manager", disc_type: "D", disc_scores: { D: 36, I: 21, S: 12, C: 19 } },
  
  // Project Managers
  { name: "Casey Wilson", email: "casey.w@agency.com", role: "Project Manager", disc_type: "C", disc_scores: { D: 16, I: 13, S: 21, C: 38 } },
  { name: "Riley Martinez", email: "riley.m@agency.com", role: "Senior Project Manager", disc_type: "S", disc_scores: { D: 15, I: 19, S: 36, C: 18 } },
  
  // Creatives
  { name: "Avery Chen", email: "avery.c@agency.com", role: "Creative Director", disc_type: "I", disc_scores: { D: 24, I: 34, S: 18, C: 12 } },
  { name: "Quinn Taylor", email: "quinn.t@agency.com", role: "Designer", disc_type: "C", disc_scores: { D: 14, I: 16, S: 19, C: 39 } },
  
  // Strategy
  { name: "Sam Rodriguez", email: "sam.r@agency.com", role: "Strategy Lead", disc_type: "C", disc_scores: { D: 18, I: 12, S: 20, C: 38 } },
  { name: "Parker Williams", email: "parker.w@agency.com", role: "Digital Strategist", disc_type: "D", disc_scores: { D: 34, I: 23, S: 13, C: 18 } },
  
  // Client Success
  { name: "Dakota Brown", email: "dakota.b@agency.com", role: "Client Success Manager", disc_type: "S", disc_scores: { D: 13, I: 22, S: 37, C: 16 } },
  { name: "Sage Anderson", email: "sage.a@agency.com", role: "Client Success Lead", disc_type: "I", disc_scores: { D: 20, I: 36, S: 21, C: 11 } },
  
  // Analytics
  { name: "River Kim", email: "river.k@agency.com", role: "Analytics Manager", disc_type: "C", disc_scores: { D: 17, I: 11, S: 18, C: 42 } },
  { name: "Skyler White", email: "skyler.w@agency.com", role: "Data Analyst", disc_type: "C", disc_scores: { D: 15, I: 14, S: 20, C: 39 } },
  
  // Sales/BD
  { name: "Phoenix Garcia", email: "phoenix.g@agency.com", role: "Business Development", disc_type: "D", disc_scores: { D: 37, I: 24, S: 11, C: 16 } },
  { name: "Peyton Miller", email: "peyton.m@agency.com", role: "Sales Executive", disc_type: "I", disc_scores: { D: 25, I: 35, S: 19, C: 9 } },
  
  // Operations
  { name: "Cameron Johnson", email: "cameron.j@agency.com", role: "Operations Manager", disc_type: "S", disc_scores: { D: 16, I: 18, S: 35, C: 19 } },
  { name: "Finley Davis", email: "finley.d@agency.com", role: "Operations Coordinator", disc_type: "C", disc_scores: { D: 14, I: 15, S: 22, C: 37 } },
  
  // Content
  { name: "Reese Martin", email: "reese.m@agency.com", role: "Content Lead", disc_type: "I", disc_scores: { D: 19, I: 33, S: 23, C: 13 } },
  { name: "Jamie Lopez", email: "jamie.l@agency.com", role: "Content Writer", disc_type: "S", disc_scores: { D: 12, I: 21, S: 36, C: 19 } },
  
  // Technical
  { name: "Taylor Wilson", email: "taylor.w@agency.com", role: "Tech Lead", disc_type: "C", disc_scores: { D: 19, I: 13, S: 17, C: 39 } },
  { name: "Drew Moore", email: "drew.m@agency.com", role: "Developer", disc_type: "C", disc_scores: { D: 16, I: 12, S: 21, C: 39 } },
  
  // Media
  { name: "Blake Thomas", email: "blake.t@agency.com", role: "Media Buyer", disc_type: "D", disc_scores: { D: 33, I: 22, S: 14, C: 19 } },
  { name: "Jesse Jackson", email: "jesse.j@agency.com", role: "Media Planner", disc_type: "C", disc_scores: { D: 17, I: 14, S: 19, C: 38 } },
  
  // Leadership
  { name: "Charlie Harris", email: "charlie.h@agency.com", role: "VP of Client Services", disc_type: "D", disc_scores: { D: 38, I: 23, S: 10, C: 17 } },
  { name: "Avery Clark", email: "avery.clark@agency.com", role: "Managing Director", disc_type: "I", disc_scores: { D: 28, I: 34, S: 16, C: 10 } },
];

const demoClients: DemoClient[] = [
  // Dominant (D) types
  { name: "Marcus Chen", email: "marcus.chen@techcorp.com", company: "TechCorp Industries", disc_type: "D", disc_scores: { D: 35, I: 20, S: 15, C: 18 } },
  { name: "Victoria Stone", email: "v.stone@alphaventures.com", company: "Alpha Ventures", disc_type: "D", disc_scores: { D: 38, I: 18, S: 12, C: 20 } },
  { name: "Derek Martinez", email: "derek.m@pinnaclegroup.com", company: "Pinnacle Group", disc_type: "D", disc_scores: { D: 36, I: 22, S: 10, C: 20 } },
  { name: "Rebecca Foster", email: "rfoster@dynamicsolutions.com", company: "Dynamic Solutions", disc_type: "D", disc_scores: { D: 34, I: 19, S: 14, C: 21 } },
  { name: "James Rodriguez", email: "j.rodriguez@apex.io", company: "Apex Innovations", disc_type: "D", disc_scores: { D: 37, I: 21, S: 11, C: 19 } },
  
  // Influential (I) types
  { name: "Sophia Williams", email: "sophia@brightideas.co", company: "Bright Ideas Co", disc_type: "I", disc_scores: { D: 18, I: 36, S: 20, C: 14 } },
  { name: "Tyler Anderson", email: "tyler.a@creativehub.com", company: "Creative Hub", disc_type: "I", disc_scores: { D: 20, I: 38, S: 18, C: 12 } },
  { name: "Emma Thompson", email: "emma.t@socialsynergy.com", company: "Social Synergy", disc_type: "I", disc_scores: { D: 16, I: 35, S: 22, C: 15 } },
  { name: "David Park", email: "dpark@innovateagency.com", company: "Innovate Agency", disc_type: "I", disc_scores: { D: 22, I: 34, S: 19, C: 13 } },
  { name: "Isabella Garcia", email: "igarcia@sparknetwork.com", company: "Spark Network", disc_type: "I", disc_scores: { D: 19, I: 37, S: 21, C: 11 } },
  { name: "Ryan Mitchell", email: "ryan@energybrands.com", company: "Energy Brands", disc_type: "I", disc_scores: { D: 17, I: 36, S: 23, C: 12 } },
  
  // Steady (S) types
  { name: "Jennifer Lee", email: "j.lee@harmonyservices.com", company: "Harmony Services", disc_type: "S", disc_scores: { D: 14, I: 20, S: 36, C: 18 } },
  { name: "Michael Brown", email: "mbrown@reliablepartners.com", company: "Reliable Partners", disc_type: "S", disc_scores: { D: 12, I: 18, S: 38, C: 20 } },
  { name: "Amanda Wilson", email: "awilson@steadyrock.com", company: "Steady Rock Consulting", disc_type: "S", disc_scores: { D: 15, I: 22, S: 35, C: 16 } },
  { name: "Christopher Davis", email: "c.davis@peaceful.io", company: "Peaceful Solutions", disc_type: "S", disc_scores: { D: 13, I: 19, S: 37, C: 19 } },
  { name: "Sarah Martinez", email: "smartinez@supportive.com", company: "Supportive Systems", disc_type: "S", disc_scores: { D: 11, I: 21, S: 36, C: 20 } },
  { name: "Daniel Taylor", email: "dtaylor@harmony.biz", company: "Harmony Health", disc_type: "S", disc_scores: { D: 16, I: 20, S: 34, C: 18 } },
  
  // Conscientious (C) types
  { name: "Elizabeth Chen", email: "e.chen@precisiondata.com", company: "Precision Data Corp", disc_type: "C", disc_scores: { D: 16, I: 12, S: 20, C: 40 } },
  { name: "Robert Anderson", email: "randerson@analytics.pro", company: "Analytics Pro", disc_type: "C", disc_scores: { D: 18, I: 14, S: 18, C: 38 } },
  { name: "Michelle White", email: "mwhite@qualityassurance.com", company: "Quality Assurance Inc", disc_type: "C", disc_scores: { D: 15, I: 13, S: 19, C: 41 } },
  { name: "Kevin Thompson", email: "kthompson@systematic.io", company: "Systematic Solutions", disc_type: "C", disc_scores: { D: 17, I: 11, S: 21, C: 39 } },
  { name: "Laura Johnson", email: "ljohnson@detailmasters.com", company: "Detail Masters", disc_type: "C", disc_scores: { D: 14, I: 15, S: 20, C: 39 } },
  { name: "Brian Miller", email: "bmiller@accurateresults.com", company: "Accurate Results LLC", disc_type: "C", disc_scores: { D: 19, I: 12, S: 18, C: 39 } },
  
  // Mixed profiles
  { name: "Ashley Roberts", email: "aroberts@balanced.biz", company: "Balanced Business Group", disc_type: "I", disc_scores: { D: 25, I: 28, S: 22, C: 13 } },
  { name: "Justin Harris", email: "jharris@versatile.co", company: "Versatile Ventures", disc_type: "D", disc_scores: { D: 30, I: 24, S: 16, C: 18 } },
  { name: "Nicole Davis", email: "ndavis@adaptive.com", company: "Adaptive Solutions", disc_type: "S", disc_scores: { D: 20, I: 22, S: 28, C: 18 } },
];

// Generate realistic assessment responses based on DISC type
function generateAssessmentResponses(discType: string): Record<string, string> {
  const dominantPatterns: Record<string, string> = {
    D: 'A', // Direct, decisive
    I: 'A', // Outgoing, optimistic
    S: 'B', // Patient, reliable
    C: 'B', // Analytical, precise
  };

  const responses: Record<string, string> = {};
  
  // Generate 24 responses based on personality
  for (let i = 1; i <= 24; i++) {
    const questionId = `q${i}`;
    // Use personality-aligned responses with some variation
    if (Math.random() > 0.3) {
      responses[questionId] = dominantPatterns[discType];
    } else {
      // Add some variation
      responses[questionId] = dominantPatterns[discType] === 'A' ? 'B' : 'A';
    }
  }
  
  return responses;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Seeding demo data for user: ${user.id}`);

    // Rate limiting: Check last seed time
    const { data: lastSeed, error: seedLogError } = await supabase
      .from('demo_seed_log')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (seedLogError) {
      console.error('Error checking seed log:', seedLogError);
    }

    if (lastSeed) {
      const hoursSinceLastSeed = 
        (Date.now() - new Date(lastSeed.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSeed < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastSeed);
        return new Response(
          JSON.stringify({ 
            error: `Demo data can only be reset once per 24 hours. Please try again in ${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'}.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    // Clean up existing demo data before seeding
    const demoEmails = demoClients.map(c => c.email);
    const demoStaffEmails = demoStaff.map(s => s.email);
    
    console.log('Checking for existing demo data...');
    
    // Find all existing clients and staff for this user to clean up
    const { data: existingDemoClients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id);
    
    if (existingDemoClients && existingDemoClients.length > 0) {
      console.log(`Found ${existingDemoClients.length} existing demo clients, cleaning up...`);
      
      const demoClientIds = existingDemoClients.map(c => c.id);
      
      // Delete related data in order (respecting foreign keys)
      // 1. Delete disc_insights
      const { error: insightsDeleteError } = await supabase
        .from('disc_insights')
        .delete()
        .in('client_id', demoClientIds);
      
      if (insightsDeleteError) {
        console.error('Error deleting demo insights:', insightsDeleteError);
      }
      
      // 2. Delete assessments
      const { error: assessmentsDeleteError } = await supabase
        .from('assessments')
        .delete()
        .in('client_id', demoClientIds);
      
      if (assessmentsDeleteError) {
        console.error('Error deleting demo assessments:', assessmentsDeleteError);
      }
      
      // 3. Delete email tracking
      const { error: trackingDeleteError } = await supabase
        .from('email_tracking')
        .delete()
        .in('client_id', demoClientIds);
      
      if (trackingDeleteError) {
        console.error('Error deleting demo email tracking:', trackingDeleteError);
      }
      
      // 4. Delete clients
      const { error: clientsDeleteError } = await supabase
        .from('clients')
        .delete()
        .in('id', demoClientIds);
      
      if (clientsDeleteError) {
        console.error('Error deleting demo clients:', clientsDeleteError);
        throw clientsDeleteError;
      }
      
      console.log('Successfully cleaned up existing demo clients and related data');
    }
    
    // Clean up existing demo staff
    const { data: existingDemoStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('user_id', user.id);
    
    if (existingDemoStaff && existingDemoStaff.length > 0) {
      console.log(`Found ${existingDemoStaff.length} existing demo staff, cleaning up...`);
      
      const { error: staffDeleteError } = await supabase
        .from('staff')
        .delete()
        .in('id', existingDemoStaff.map(s => s.id));
      
      if (staffDeleteError) {
        console.error('Error deleting demo staff:', staffDeleteError);
        throw staffDeleteError;
      }
      
      console.log('Successfully cleaned up existing demo staff');
    }

    const clientsToInsert = demoClients.map((client, index) => {
      // Ensure globally unique demo emails by namespacing with user id
      const [localPart, domain] = client.email.split("@");
      const uniqueEmail = `${localPart}+demo-${user.id}-${index}@${domain}`;

      return {
        user_id: user.id,
        name: client.name,
        email: uniqueEmail,
        company: client.company,
        disc_type: client.disc_type,
        disc_scores: client.disc_scores,
      };
    });

    const { data: insertedClients, error: clientError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select();

    if (clientError) {
      console.error('Error inserting clients:', clientError);
      throw clientError;
    }

    console.log(`Successfully inserted ${insertedClients?.length} clients`);

    const staffToInsert = demoStaff.map((staff, index) => {
      const [localPart, domain] = staff.email.split("@");
      const uniqueEmail = `${localPart}+demo-${user.id}-${index}@${domain}`;

      return {
        user_id: user.id,
        name: staff.name,
        email: uniqueEmail,
        role: staff.role,
        disc_type: staff.disc_type,
        disc_scores: staff.disc_scores,
      };
    });

    const { data: insertedStaff, error: staffError } = await supabase
      .from('staff')
      .insert(staffToInsert)
      .select();

    if (staffError) {
      console.error('Error inserting staff:', staffError);
      throw staffError;
    }

    console.log(`Successfully inserted ${insertedStaff?.length} staff members`);

    // Create assessments for each client
    const assessmentsToInsert = insertedClients?.map((client, index) => {
      const originalClient = demoClients[index];
      return {
        client_id: client.id,
        responses: generateAssessmentResponses(originalClient.disc_type),
        scores: originalClient.disc_scores,
        dominant_type: originalClient.disc_type,
      };
    }) || [];

    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert(assessmentsToInsert);

    if (assessmentError) {
      console.error('Error inserting assessments:', assessmentError);
      throw assessmentError;
    }

    console.log(`Successfully inserted ${assessmentsToInsert.length} assessments`);

    // Generate AI insights for all clients in parallel
    console.log('Generating AI insights for all clients...');
    
    const insightPromises = insertedClients?.map(async (client) => {
      try {
        const { error: insightError } = await supabase.functions.invoke('generate-disc-insights', {
          body: { 
            clientId: client.id,
            discType: client.disc_type,
            scores: client.disc_scores,
            clientName: client.name
          }
        });
        
        if (insightError) {
          console.error(`Failed to generate insights for client ${client.id}:`, insightError);
          return { clientId: client.id, success: false };
        }
        
        return { clientId: client.id, success: true };
      } catch (error) {
        console.error(`Error generating insights for client ${client.id}:`, error);
        return { clientId: client.id, success: false };
      }
    }) || [];

    const insightResults = await Promise.all(insightPromises);
    const successfulInsights = insightResults.filter(r => r.success).length;
    
    console.log(`Generated AI insights for ${successfulInsights}/${insertedClients?.length} clients`);

    // Log this seed operation for rate limiting
    const { error: logError } = await supabase
      .from('demo_seed_log')
      .insert({ user_id: user.id });
    
    if (logError) {
      console.error('Error logging seed operation:', logError);
      // Don't fail the entire operation if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created 25 demo clients and 25 staff members with diverse DISC profiles and AI insights`,
        clientsCreated: insertedClients?.length,
        staffCreated: insertedStaff?.length,
        assessmentsCreated: assessmentsToInsert.length,
        insightsGenerated: successfulInsights,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in seed-demo-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
