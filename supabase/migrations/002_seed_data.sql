-- Seed data for Interior Systems

-- Insert sample materials
INSERT INTO public.materials (name, category, color, sustainability_rating, co2_per_sqm, cost_per_sqm) VALUES
('Oak Hardwood', 'Flooring', '#DEB887', 85, 12.5, 45.00),
('Bamboo Flooring', 'Flooring', '#D2B48C', 95, 8.2, 38.50),
('Recycled Glass Tile', 'Tile', '#87CEEB', 92, 6.8, 55.00),
('Ceramic Tile', 'Tile', '#F5F5DC', 75, 15.3, 28.00),
('Reclaimed Wood', 'Wood', '#8B4513', 98, 4.1, 62.00),
('Cork Flooring', 'Flooring', '#C19A6B', 90, 7.5, 42.00),
('Natural Stone', 'Stone', '#696969', 80, 18.9, 75.00),
('Linoleum', 'Flooring', '#F0E68C', 88, 9.2, 32.00),
('Concrete', 'Structural', '#808080', 70, 22.5, 25.00),
('Hemp Fabric', 'Textile', '#E8DCC4', 96, 3.8, 48.00);

-- Insert sample vendors
INSERT INTO public.vendors (name, website, sustainability_score, shipping_regions, is_active) VALUES
('IKEA', 'https://www.ikea.com', 78, ARRAY['North America', 'Europe', 'Asia'], true),
('West Elm', 'https://www.westelm.com', 82, ARRAY['North America', 'Europe'], true),
('CB2', 'https://www.cb2.com', 75, ARRAY['North America'], true),
('Restoration Hardware', 'https://www.rh.com', 70, ARRAY['North America', 'Europe'], true),
('Article', 'https://www.article.com', 85, ARRAY['North America'], true),
('Wayfair', 'https://www.wayfair.com', 68, ARRAY['North America', 'Europe'], true),
('Crate & Barrel', 'https://www.crateandbarrel.com', 80, ARRAY['North America'], true),
('Herman Miller', 'https://www.hermanmiller.com', 90, ARRAY['Global'], true),
('Room & Board', 'https://www.roomandboard.com', 87, ARRAY['North America'], true),
('EcoBalanza', 'https://www.ecobalanza.com', 95, ARRAY['North America', 'Europe'], true);

-- Function to create demo project for new users
CREATE OR REPLACE FUNCTION public.create_demo_project(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id uuid;
  room_id uuid;
BEGIN
  -- Create demo project
  INSERT INTO public.projects (user_id, name, description, status, total_budget, total_area)
  VALUES (
    user_id,
    'Demo Project - Modern Living Space',
    'A sample project to help you get started with Interior Systems. Feel free to modify or delete this project.',
    'active',
    15000.00,
    45.00
  )
  RETURNING id INTO project_id;

  -- Create demo room
  INSERT INTO public.rooms (project_id, name, room_type, width, length, height)
  VALUES (
    project_id,
    'Living Room',
    'living',
    6.0,
    7.5,
    3.0
  )
  RETURNING id INTO room_id;

  -- Add some demo objects
  INSERT INTO public.objects (room_id, name, object_type, position_x, position_y, width, height, color, price, co2_footprint)
  VALUES
    (room_id, 'Sectional Sofa', 'furniture', 100, 100, 250, 90, '#8B4513', 1200.00, 45.5),
    (room_id, 'Coffee Table', 'furniture', 200, 250, 120, 60, '#DEB887', 350.00, 15.2),
    (room_id, 'Floor Lamp', 'lighting', 400, 100, 30, 180, '#F4A460', 120.00, 8.5),
    (room_id, 'Area Rug', 'decor', 150, 180, 200, 150, '#CD853F', 280.00, 12.3),
    (room_id, 'TV Stand', 'furniture', 450, 50, 180, 60, '#696969', 450.00, 22.1);

  RETURN project_id;
END;
$$;

-- Function to initialize user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'hobbyist'
  );

  -- Create demo project
  PERFORM public.create_demo_project(NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger to create profile and demo project for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create sample palette
CREATE OR REPLACE FUNCTION public.create_sample_palettes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Note: This would normally be called with actual user IDs
  -- For now, it's just a reference for the structure
  
  -- Modern Neutral Palette
  -- INSERT INTO public.palettes (user_id, name, colors, is_public)
  -- VALUES (
  --   user_id,
  --   'Modern Neutral',
  --   '[
  --     {"hex": "#F5F5F5", "name": "White Smoke", "percentage": 40},
  --     {"hex": "#A0A0A0", "name": "Silver", "percentage": 25},
  --     {"hex": "#696969", "name": "Dim Gray", "percentage": 20},
  --     {"hex": "#2C2C2C", "name": "Dark Gray", "percentage": 15}
  --   ]'::jsonb,
  --   true
  -- );
END;
$$;

-- Refresh materialized view initially
REFRESH MATERIALIZED VIEW public.project_metrics;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.objects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;