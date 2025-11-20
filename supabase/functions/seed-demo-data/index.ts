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

    // Check if user already has clients to avoid duplicates
    const { count: existingCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (existingCount && existingCount > 10) {
      return new Response(
        JSON.stringify({ 
          error: 'Account already has significant data. Clear existing clients first or use a new account.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert all demo clients
    const clientsToInsert = demoClients.map(client => ({
      user_id: user.id,
      name: client.name,
      email: client.email,
      company: client.company,
      disc_type: client.disc_type,
      disc_scores: client.disc_scores,
    }));

    const { data: insertedClients, error: clientError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select();

    if (clientError) {
      console.error('Error inserting clients:', clientError);
      throw clientError;
    }

    console.log(`Successfully inserted ${insertedClients?.length} clients`);

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
          body: { clientId: client.id }
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created 25 demo clients with diverse DISC profiles and AI insights`,
        clientsCreated: insertedClients?.length,
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
