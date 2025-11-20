-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type TEXT NOT NULL CHECK (template_type IN ('invitation', 'reminder')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  company_name TEXT,
  company_logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update email templates" 
ON public.email_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete email templates" 
ON public.email_templates 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.email_templates (template_type, subject, content, company_name, primary_color)
VALUES 
(
  'invitation',
  'Complete Your DISC Personality Assessment',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333; border-bottom: 3px solid {{PRIMARY_COLOR}}; padding-bottom: 10px;">DISC Personality Assessment</h1>
    <p style="color: #555; font-size: 16px;">Hi {{CLIENT_NAME}},</p>
    <p style="color: #555; font-size: 16px;">
      We''d like to understand your communication style better. Please take a few minutes to complete this DISC personality assessment.
    </p>
    <p style="color: #555; font-size: 16px;">
      The assessment consists of 24 quick questions and takes about 5-10 minutes to complete.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ASSESSMENT_LINK}}" 
         style="background-color: {{PRIMARY_COLOR}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Take Assessment
      </a>
    </div>
    <p style="color: #888; font-size: 14px;">
      Or copy this link: <a href="{{ASSESSMENT_LINK}}" style="color: {{PRIMARY_COLOR}};">{{ASSESSMENT_LINK}}</a>
    </p>
    <p style="color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
      This assessment will help us communicate with you more effectively.
    </p>
  </div>',
  'ClientKey',
  '#4F46E5'
),
(
  'reminder',
  'Reminder: Complete Your DISC Assessment',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333; border-bottom: 3px solid {{PRIMARY_COLOR}}; padding-bottom: 10px;">Friendly Reminder</h1>
    <p style="color: #555; font-size: 16px;">Hi {{CLIENT_NAME}},</p>
    <p style="color: #555; font-size: 16px;">
      We noticed you started but haven''t completed your DISC personality assessment yet. It only takes 5-10 minutes!
    </p>
    <p style="color: #555; font-size: 16px;">
      Understanding your communication style will help us work together more effectively.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ASSESSMENT_LINK}}" 
         style="background-color: {{PRIMARY_COLOR}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Complete Assessment Now
      </a>
    </div>
    <p style="color: #888; font-size: 14px;">
      Or copy this link: <a href="{{ASSESSMENT_LINK}}" style="color: {{PRIMARY_COLOR}};">{{ASSESSMENT_LINK}}</a>
    </p>
    <p style="color: #888; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
      If you have any questions, please don''t hesitate to reach out.
    </p>
  </div>',
  'ClientKey',
  '#4F46E5'
);