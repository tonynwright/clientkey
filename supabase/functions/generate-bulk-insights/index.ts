import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkInsightRequest {
  clientIds?: string[];
  analyzeAll?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientIds, analyzeAll = false }: BulkInsightRequest = await req.json();

    console.log('Starting bulk insights generation');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Authenticate user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }
    const userId = userData.user.id;

    // Fetch clients
    let clientsQuery = supabase
      .from('clients')
      .select('id, name, disc_type, disc_scores')
      .eq('user_id', userId)
      .not('disc_type', 'is', null);

    if (!analyzeAll && clientIds && clientIds.length > 0) {
      clientsQuery = clientsQuery.in('id', clientIds);
    }

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) throw clientsError;
    if (!clients || clients.length === 0) {
      throw new Error('No clients found with DISC assessments');
    }

    console.log(`Analyzing ${clients.length} clients`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate aggregate statistics
    const discTypeCounts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
    const avgScores = { D: 0, I: 0, S: 0, C: 0 };

    clients.forEach(client => {
      if (client.disc_type) {
        discTypeCounts[client.disc_type] = (discTypeCounts[client.disc_type] || 0) + 1;
      }
      if (client.disc_scores) {
        avgScores.D += client.disc_scores.D || 0;
        avgScores.I += client.disc_scores.I || 0;
        avgScores.S += client.disc_scores.S || 0;
        avgScores.C += client.disc_scores.C || 0;
      }
    });

    // Calculate averages
    Object.keys(avgScores).forEach(key => {
      avgScores[key as keyof typeof avgScores] = Math.round(avgScores[key as keyof typeof avgScores] / clients.length);
    });

    // Build client summary for AI
    const clientSummary = clients.map(c => 
      `- ${c.name}: ${c.disc_type} type (D:${c.disc_scores?.D}%, I:${c.disc_scores?.I}%, S:${c.disc_scores?.S}%, C:${c.disc_scores?.C}%)`
    ).join('\n');

    const systemPrompt = `You are an expert organizational psychologist and DISC assessment analyst. Your role is to analyze groups of clients and identify meaningful patterns, trends, and insights that help agencies understand their client base better.`;

    const userPrompt = `Analyze this client base and provide strategic insights:

**Client Base Overview:**
Total Clients: ${clients.length}

**DISC Type Distribution:**
- Dominance (D): ${discTypeCounts.D} clients (${Math.round(discTypeCounts.D / clients.length * 100)}%)
- Influence (I): ${discTypeCounts.I} clients (${Math.round(discTypeCounts.I / clients.length * 100)}%)
- Steadiness (S): ${discTypeCounts.S} clients (${Math.round(discTypeCounts.S / clients.length * 100)}%)
- Conscientiousness (C): ${discTypeCounts.C} clients (${Math.round(discTypeCounts.C / clients.length * 100)}%)

**Average Scores Across All Clients:**
- D: ${avgScores.D}%
- I: ${avgScores.I}%
- S: ${avgScores.S}%
- C: ${avgScores.C}%

**Individual Client Profiles:**
${clientSummary}

Please provide:

1. **Client Base Composition Analysis**: What does the overall distribution tell us about this client portfolio?

2. **Communication Strategy Recommendations**: Based on the dominant personality types, what overall communication approach should the agency adopt?

3. **Potential Challenges**: What challenges might arise with this specific mix of personalities?

4. **Team Dynamics Insights**: How might these clients work together if they were to collaborate? What complementary strengths exist?

5. **Growth Opportunities**: What types of clients or personality types should the agency consider targeting to create better balance?

6. **Key Patterns**: What notable patterns or trends do you see in this client base?

7. **Actionable Recommendations**: Provide 3-5 specific, actionable steps the agency can take to better serve this client portfolio.

Keep insights strategic, data-driven, and immediately actionable.`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('Successfully generated bulk insights');

    return new Response(
      JSON.stringify({ 
        insights,
        statistics: {
          totalClients: clients.length,
          discTypeCounts,
          avgScores,
        },
        clients: clients.map(c => ({
          id: c.id,
          name: c.name,
          discType: c.disc_type,
        })),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-bulk-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
