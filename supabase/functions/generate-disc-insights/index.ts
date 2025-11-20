import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  discType: string;
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  clientName?: string;
  context?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discType, scores, clientName, context }: InsightRequest = await req.json();

    console.log('Generating insights for:', { discType, scores, clientName });

    if (!discType || !scores) {
      throw new Error('DISC type and scores are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a detailed prompt for the AI
    const systemPrompt = `You are an expert in DISC personality assessments and workplace communication. Your role is to provide insightful, actionable analysis for agencies working with their clients. 

Key principles:
- Be specific and actionable in your recommendations
- Focus on practical communication strategies
- Highlight both strengths and potential challenges
- Provide concrete examples where possible
- Keep insights professional and constructive`;

    const userPrompt = `Analyze this DISC personality profile and provide comprehensive insights:

Client: ${clientName || 'Client'}
Dominant Type: ${discType}
DISC Scores:
- Dominance (D): ${scores.D}%
- Influence (I): ${scores.I}%
- Steadiness (S): ${scores.S}%
- Conscientiousness (C): ${scores.C}%

${context ? `Additional Context: ${context}` : ''}

Please provide:
1. **Core Characteristics**: Key personality traits based on the dominant type and score distribution
2. **Communication Preferences**: How this person prefers to communicate and make decisions
3. **Motivators**: What drives and motivates this personality type
4. **Potential Stress Triggers**: What situations might cause stress or frustration
5. **Working Style**: How they approach tasks and collaboration
6. **Best Practices for Engagement**: Specific strategies for effective communication and collaboration
7. **Red Flags to Avoid**: What NOT to do when working with this personality type

Keep the insights concise, practical, and actionable for agency professionals.`;

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
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
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

    console.log('Successfully generated insights');

    return new Response(
      JSON.stringify({ 
        insights,
        discType,
        scores,
        clientName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-disc-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
