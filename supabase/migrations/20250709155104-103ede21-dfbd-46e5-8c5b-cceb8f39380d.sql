-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories for existing users (without ឆេះប្រេង)
INSERT INTO public.categories (user_id, name, type, color) 
SELECT 
  profiles.user_id,
  category_data.name,
  category_data.type,
  category_data.color
FROM profiles
CROSS JOIN (
  VALUES 
    ('ប្រាក់ខែ', 'income', 'emerald'),
    ('បន្ថែម', 'income', 'green'),
    ('លក់របស់', 'income', 'teal'),
    ('ការដាក់វិនិយោគ', 'income', 'cyan'),
    ('អាហារ', 'expense', 'red'),
    ('ដឹកជញ្ជូន', 'expense', 'amber'),
    ('សុខភាព', 'expense', 'rose'),
    ('កម្សាន្ត', 'expense', 'pink'),
    ('សំលៀកបំពាក់', 'expense', 'purple')
) AS category_data(name, type, color);