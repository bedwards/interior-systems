import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { createClient } from '@supabase/supabase-js';
import * as jose from 'jose';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AI: any;
  RATE_LIMITER: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: ['https://bedwards.github.io', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting middleware
const rateLimit = async (c: any, next: any) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 100;

  const data = await c.env.RATE_LIMITER.get(key, 'json');
  const requests = data?.requests || [];
  const recentRequests = requests.filter((ts: number) => now - ts < windowMs);

  if (recentRequests.length >= maxRequests) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  recentRequests.push(now);
  await c.env.RATE_LIMITER.put(key, JSON.stringify({ requests: recentRequests }), {
    expirationTtl: windowMs / 1000,
  });

  await next();
};

app.use('/api/*', rateLimit);

// JWT authentication middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL(`${c.env.SUPABASE_URL}/auth/v1/jwks`)
    );
    
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `${c.env.SUPABASE_URL}/auth/v1`,
    });

    c.set('userId', payload.sub);
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Initialize Supabase client
const getSupabaseClient = (env: Env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Thumbnail generation endpoint
app.post('/api/thumbnails', authMiddleware, async (c) => {
  try {
    const { imageUrl, width = 200, height = 200 } = await c.req.json();
    
    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return c.json({ error: 'Failed to fetch image' }, 400);
    }

    const imageBlob = await imageResponse.blob();
    
    // Simple thumbnail generation using Cloudflare Image Resizing
    const thumbnailUrl = `${imageUrl}?width=${width}&height=${height}&fit=cover`;
    
    return c.json({
      thumbnailUrl,
      originalUrl: imageUrl,
      width,
      height,
    });
  } catch (err) {
    return c.json({ error: 'Thumbnail generation failed' }, 500);
  }
});

// Palette extraction endpoint
app.post('/api/palette-extract', authMiddleware, async (c) => {
  try {
    const { imageUrl } = await c.req.json();
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return c.json({ error: 'Failed to fetch image' }, 400);
    }

    // Simple color extraction (in production, use actual image analysis)
    // This is a placeholder that would use Workers AI or external service
    const palette = [
      { hex: '#2C3E50', name: 'Dark Blue', percentage: 35 },
      { hex: '#ECF0F1', name: 'Light Gray', percentage: 30 },
      { hex: '#E74C3C', name: 'Red', percentage: 15 },
      { hex: '#3498DB', name: 'Blue', percentage: 12 },
      { hex: '#F39C12', name: 'Orange', percentage: 8 },
    ];

    return c.json({ palette, source: imageUrl });
  } catch (err) {
    return c.json({ error: 'Palette extraction failed' }, 500);
  }
});

// Semantic search using embeddings
app.post('/api/search', authMiddleware, async (c) => {
  try {
    const { query, type = 'all' } = await c.req.json();
    const userId = c.get('userId');
    
    const supabase = getSupabaseClient(c.env);
    
    // Generate embedding using Workers AI
    let embedding: number[] = [];
    
    if (c.env.AI) {
      const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: query,
      });
      embedding = embeddingResponse.data[0];
    }

    // Search in Supabase using vector similarity
    const { data, error } = await supabase.rpc('search_projects', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10,
      user_id: userId,
    });

    if (error) throw error;

    return c.json({ results: data, query });
  } catch (err) {
    return c.json({ error: 'Search failed' }, 500);
  }
});

// Vendor data refresh (called by cron)
app.get('/api/cron/refresh-vendors', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    
    // Fetch latest vendor pricing
    // This would call external APIs for real vendor data
    const vendors = [
      { id: 1, name: 'IKEA', pricing_updated: new Date().toISOString() },
      { id: 2, name: 'West Elm', pricing_updated: new Date().toISOString() },
      { id: 3, name: 'CB2', pricing_updated: new Date().toISOString() },
    ];

    // Update sustainability scores
    for (const vendor of vendors) {
      await supabase
        .from('vendors')
        .update({ 
          last_sync: new Date().toISOString(),
          sustainability_score: Math.floor(Math.random() * 100),
        })
        .eq('id', vendor.id);
    }

    return c.json({ 
      status: 'success', 
      vendorsUpdated: vendors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ error: 'Vendor refresh failed' }, 500);
  }
});

// Lighting calculation endpoint
app.post('/api/lighting-calc', authMiddleware, async (c) => {
  try {
    const { roomArea, ceilingHeight, naturalLight, activity } = await c.req.json();
    
    // Calculate recommended lumens
    const baseMultiplier = activity === 'office' ? 300 : 
                          activity === 'kitchen' ? 250 :
                          activity === 'living' ? 150 : 100;
    
    const recommendedLumens = roomArea * baseMultiplier;
    const adjustedLumens = naturalLight === 'high' ? 
      recommendedLumens * 0.7 : 
      naturalLight === 'low' ? 
      recommendedLumens * 1.3 : 
      recommendedLumens;

    const fixtures = Math.ceil(adjustedLumens / 800); // Assume 800 lumens per fixture
    
    return c.json({
      roomArea,
      ceilingHeight,
      recommendedLumens: Math.round(adjustedLumens),
      recommendedFixtures: fixtures,
      fixtureSpacing: Math.sqrt(roomArea / fixtures).toFixed(2),
      energyEstimate: (adjustedLumens / 100).toFixed(2) + ' W',
    });
  } catch (err) {
    return c.json({ error: 'Lighting calculation failed' }, 500);
  }
});

// Sustainability analysis
app.post('/api/sustainability', authMiddleware, async (c) => {
  try {
    const { projectId } = await c.req.json();
    const userId = c.get('userId');
    
    const supabase = getSupabaseClient(c.env);
    
    // Get project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, objects(*), materials(*)')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Calculate CO2 footprint (simplified)
    let totalCO2 = 0;
    let sustainabilityScore = 0;

    if (project.objects) {
      project.objects.forEach((obj: any) => {
        totalCO2 += obj.co2_footprint || 0;
      });
    }

    if (project.materials) {
      project.materials.forEach((mat: any) => {
        totalCO2 += mat.co2_per_sqm || 0;
        sustainabilityScore += mat.sustainability_rating || 0;
      });
      sustainabilityScore = sustainabilityScore / project.materials.length;
    }

    return c.json({
      projectId,
      totalCO2: totalCO2.toFixed(2),
      sustainabilityScore: sustainabilityScore.toFixed(1),
      recommendations: [
        'Consider using recycled materials',
        'Replace high-emission items with sustainable alternatives',
        'Source locally to reduce transportation emissions',
      ],
    });
  } catch (err) {
    return c.json({ error: 'Sustainability analysis failed' }, 500);
  }
});

// Proxy endpoint for Supabase with auth validation
app.all('/api/supabase/*', authMiddleware, async (c) => {
  try {
    const path = c.req.path.replace('/api/supabase/', '');
    const url = `${c.env.SUPABASE_URL}/rest/v1/${path}`;
    const method = c.req.method;
    const headers = new Headers(c.req.header());
    
    headers.set('apikey', c.env.SUPABASE_SERVICE_ROLE_KEY);
    headers.set('Authorization', `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY}`);

    const body = method !== 'GET' ? await c.req.text() : undefined;

    const response = await fetch(url, { method, headers, body });
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return c.json({ error: 'Proxy request failed' }, 500);
  }
});

// Scheduled cron trigger
export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Trigger vendor refresh daily at midnight
    ctx.waitUntil(
      fetch(`${env.SUPABASE_URL}/api/cron/refresh-vendors`)
    );
  },
};