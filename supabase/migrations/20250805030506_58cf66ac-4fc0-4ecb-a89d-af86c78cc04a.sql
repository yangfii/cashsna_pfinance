-- Create notes table for iPhone-style notes functionality
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}'::jsonb,
  plain_text_content TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  folder_id UUID,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  media_attachments JSONB DEFAULT '[]'::jsonb,
  collaboration_settings JSONB DEFAULT '{"shared":false,"collaborators":[],"permissions":"view"}'::jsonb,
  template_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create folders table for note organization
CREATE TABLE public.note_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create note_tags table for better tag management
CREATE TABLE public.note_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT 'gray',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for note_folders
CREATE POLICY "Users can view their own note folders" 
ON public.note_folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own note folders" 
ON public.note_folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note folders" 
ON public.note_folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note folders" 
ON public.note_folders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for note_tags
CREATE POLICY "Users can view their own note tags" 
ON public.note_tags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own note tags" 
ON public.note_tags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note tags" 
ON public.note_tags 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note tags" 
ON public.note_tags 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.notes 
ADD CONSTRAINT fk_notes_folder 
FOREIGN KEY (folder_id) REFERENCES public.note_folders(id) ON DELETE SET NULL;

ALTER TABLE public.note_folders 
ADD CONSTRAINT fk_folder_parent 
FOREIGN KEY (parent_folder_id) REFERENCES public.note_folders(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX idx_notes_folder_id ON public.notes(folder_id);
CREATE INDEX idx_notes_is_favorite ON public.notes(is_favorite);
CREATE INDEX idx_notes_plain_text_search ON public.notes USING gin(to_tsvector('english', plain_text_content));

CREATE INDEX idx_note_folders_user_id ON public.note_folders(user_id);
CREATE INDEX idx_note_folders_parent ON public.note_folders(parent_folder_id);

CREATE INDEX idx_note_tags_user_id ON public.note_tags(user_id);
CREATE INDEX idx_note_tags_name ON public.note_tags(name);

-- Create trigger for updating timestamps
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_note_folders_updated_at
BEFORE UPDATE ON public.note_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update plain text content from rich content
CREATE OR REPLACE FUNCTION public.extract_plain_text_from_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract plain text from JSONB content for search indexing
  NEW.plain_text_content := COALESCE(
    jsonb_path_query_array(NEW.content, '$.content[*].content[*].text')::text,
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER extract_plain_text_trigger
BEFORE INSERT OR UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.extract_plain_text_from_content();