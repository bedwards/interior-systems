-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('student', 'professional', 'hobbyist')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  thumbnail_url TEXT,
  total_budget DECIMAL(12, 2),
  total_area DECIMAL(10, 2),
  co2_footprint DECIMAL(10, 2),
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT CHECK (room_type IN ('living', 'bedroom', 'kitchen', 'bathroom', 'office', 'other')),
  width DECIMAL(8, 2),
  length DECIMAL(8, 2),
  height DECIMAL(8, 2),
  area DECIMAL(10, 2) GENERATED ALWAYS AS (width * length) STORED,
  canvas_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objects table (furniture, decorations, etc.)
CREATE TABLE public.objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  object_type TEXT,
  position_x DECIMAL(8, 2),
  position_y DECIMAL(8, 2),
  width DECIMAL(8, 2),
  height DECIMAL(8, 2),
  rotation DECIMAL(5, 2) DEFAULT 0,
  color TEXT,
  material_id UUID REFERENCES public.materials(id),
  vendor_id UUID REFERENCES public.vendors(id),
  price DECIMAL(10, 2),
  co2_footprint DECIMAL(10, 2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Palettes table
CREATE TABLE public.palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  source_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  texture_url TEXT,
  color TEXT,
  sustainability_rating INTEGER CHECK (sustainability_rating BETWEEN 1 AND 100),
  co2_per_sqm DECIMAL(8, 4),
  cost_per_sqm DECIMAL(10, 2),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  api_endpoint TEXT,
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 1 AND 100),
  shipping_regions TEXT[],
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lighting profiles table
CREATE TABLE public.lighting_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  fixture_type TEXT,
  lumens INTEGER,
  color_temperature INTEGER,
  position_x DECIMAL(8, 2),
  position_y DECIMAL(8, 2),
  position_z DECIMAL(8, 2),
  beam_angle INTEGER,
  energy_consumption DECIMAL(6, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration table
CREATE TABLE public.collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view for project metrics
CREATE MATERIALIZED VIEW public.project_metrics AS
SELECT 
  p.id AS project_id,
  p.user_id,
  p.name,
  COUNT(DISTINCT r.id) AS room_count,
  COUNT(DISTINCT o.id) AS object_count,
  COALESCE(SUM(o.price), 0) AS total_cost,
  COALESCE(SUM(r.area), 0) AS total_area,
  COALESCE(SUM(o.co2_footprint), 0) AS total_co2,
  COALESCE(AVG(m.sustainability_rating), 0) AS avg_sustainability
FROM public.projects p
LEFT JOIN public.rooms r ON r.project_id = p.id
LEFT JOIN public.objects o ON o.room_id = r.id
LEFT JOIN public.materials m ON m.id = o.material_id
GROUP BY p.id, p.user_id, p.name;

-- Create indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_embedding ON public.projects USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_rooms_project_id ON public.rooms(project_id);
CREATE INDEX idx_objects_room_id ON public.objects(room_id);
CREATE INDEX idx_palettes_user_id ON public.palettes(user_id);
CREATE INDEX idx_palettes_project_id ON public.palettes(project_id);
CREATE INDEX idx_collaborations_project_id ON public.collaborations(project_id);
CREATE INDEX idx_activity_log_project_id ON public.activity_log(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.objects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.palettes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_log (project_id, user_id, action, entity_type, entity_id, changes)
  VALUES (
    COALESCE(NEW.project_id, OLD.project_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER audit_rooms AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER audit_objects AFTER INSERT OR UPDATE OR DELETE ON public.objects
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = projects.id AND user_id = auth.uid())
  );
CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'editor'))
  );
CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Rooms policies
CREATE POLICY "Users can view rooms in their projects" ON public.rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = rooms.project_id AND (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = projects.id AND user_id = auth.uid())))
  );
CREATE POLICY "Users can manage rooms in their projects" ON public.rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = rooms.project_id AND (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'editor'))))
  );

-- Objects policies
CREATE POLICY "Users can view objects in their rooms" ON public.objects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = objects.room_id AND (p.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = p.id AND user_id = auth.uid()))
    )
  );
CREATE POLICY "Users can manage objects in their rooms" ON public.objects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = objects.room_id AND (p.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.collaborations WHERE project_id = p.id AND user_id = auth.uid() AND role IN ('owner', 'editor')))
    )
  );

-- Palettes policies
CREATE POLICY "Users can view their palettes and public ones" ON public.palettes
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage their own palettes" ON public.palettes
  FOR ALL USING (auth.uid() = user_id);

-- Vector search function
CREATE OR REPLACE FUNCTION search_projects(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    projects.id,
    projects.name,
    projects.description,
    1 - (projects.embedding <=> query_embedding) AS similarity
  FROM projects
  WHERE 
    projects.user_id = search_projects.user_id AND
    1 - (projects.embedding <=> query_embedding) > match_threshold
  ORDER BY projects.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_project_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.project_metrics;
END;
$$;