# Interior Systems API Documentation

## Overview

The Interior Systems API consists of three layers:

1. **Supabase REST API** - Direct database access
2. **Cloudflare Worker API** - Edge compute and AI
3. **Realtime API** - WebSocket subscriptions

## Base URLs

- **Frontend**: `https://bedwards.github.io/interior-systems/`
- **Worker API**: `https://interior-systems.workers.dev/api/`
- **Supabase**: `https://your-project.supabase.co/`

## Authentication

All API requests require authentication via Supabase JWT tokens.

```typescript
// Get token after login
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// Include in requests
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Cloudflare Worker Endpoints

### Health Check

Check worker status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

---

### Generate Thumbnail

Generate thumbnail from image URL.

**Endpoint:** `POST /api/thumbnails`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "width": 200,
  "height": 200
}
```

**Response:**
```json
{
  "thumbnailUrl": "https://example.com/image.jpg?width=200&height=200&fit=cover",
  "originalUrl": "https://example.com/image.jpg",
  "width": 200,
  "height": 200
}
```

---

### Extract Color Palette

Extract dominant colors from an image.

**Endpoint:** `POST /api/palette-extract`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "palette": [
    { "hex": "#2C3E50", "name": "Dark Blue", "percentage": 35 },
    { "hex": "#ECF0F1", "name": "Light Gray", "percentage": 30 },
    { "hex": "#E74C3C", "name": "Red", "percentage": 15 }
  ],
  "source": "https://example.com/image.jpg"
}
```

---

### Semantic Search

Search projects using natural language.

**Endpoint:** `POST /api/search`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query": "modern living room with blue accents",
  "type": "all"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Modern Living Room",
      "description": "...",
      "similarity": 0.85
    }
  ],
  "query": "modern living room with blue accents"
}
```

---

### Lighting Calculator

Calculate lighting requirements for a room.

**Endpoint:** `POST /api/lighting-calc`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "roomArea": 25,
  "ceilingHeight": 3,
  "naturalLight": "medium",
  "activity": "living"
}
```

**Response:**
```json
{
  "roomArea": 25,
  "ceilingHeight": 3,
  "recommendedLumens": 3750,
  "recommendedFixtures": 5,
  "fixtureSpacing": "2.24",
  "energyEstimate": "37.50 W"
}
```

**Activity Types:**
- `office` - 300 lumens/m²
- `kitchen` - 250 lumens/m²
- `living` - 150 lumens/m²
- `bedroom` - 100 lumens/m²

---

### Sustainability Analysis

Analyze CO₂ footprint and sustainability of a project.

**Endpoint:** `POST /api/sustainability`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "projectId": "uuid"
}
```

**Response:**
```json
{
  "projectId": "uuid",
  "totalCO2": "125.50",
  "sustainabilityScore": "7.5",
  "recommendations": [
    "Consider using recycled materials",
    "Replace high-emission items with sustainable alternatives"
  ]
}
```

---

### Vendor Data Refresh (Cron)

Internal endpoint triggered daily to refresh vendor data.

**Endpoint:** `GET /api/cron/refresh-vendors`

**Response:**
```json
{
  "status": "success",
  "vendorsUpdated": 3,
  "timestamp": "2025-01-20T00:00:00.000Z"
}
```

**Note:** This endpoint is triggered automatically by Cloudflare Cron.

---

## Supabase Database API

### Projects

#### Get All Projects

```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('updated_at', { ascending: false });
```

#### Create Project

```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    name: 'My Project',
    description: 'A beautiful space',
    status: 'active'
  })
  .select()
  .single();
```

#### Update Project

```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ name: 'Updated Name' })
  .eq('id', projectId)
  .select()
  .single();
```

#### Delete Project

```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

---

### Rooms

#### Get Rooms for Project

```typescript
const { data, error } = await supabase
  .from('rooms')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: true });
```

#### Create Room

```typescript
const { data, error } = await supabase
  .from('rooms')
  .insert({
    project_id: projectId,
    name: 'Living Room',
    room_type: 'living',
    width: 5,
    length: 6,
    height: 3
  })
  .select()
  .single();
```

---

### Objects

#### Get Objects for Room

```typescript
const { data, error } = await supabase
  .from('objects')
  .select('*')
  .eq('room_id', roomId);
```

#### Create Object

```typescript
const { data, error } = await supabase
  .from('objects')
  .insert({
    room_id: roomId,
    name: 'Sofa',
    object_type: 'furniture',
    position_x: 100,
    position_y: 100,
    width: 200,
    height: 80,
    color: '#3498db'
  })
  .select()
  .single();
```

---

### Storage

#### Upload Image

```typescript
const { data, error } = await supabase.storage
  .from('project-images')
  .upload(`${projectId}/${fileName}`, file);
```

#### Get Public URL

```typescript
const { data } = supabase.storage
  .from('project-images')
  .getPublicUrl(`${projectId}/${fileName}`);
```

---

## Realtime API

### Subscribe to Project Changes

```typescript
const channel = supabase
  .channel(`project:${projectId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${projectId}`
    },
    (payload) => {
      console.log('Project updated:', payload);
    }
  )
  .subscribe();
```

### Presence (Collaborative Cursors)

```typescript
const presenceChannel = supabase.channel(`presence:${projectId}`, {
  config: { presence: { key: 'cursor' } }
});

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Active users:', state);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        cursor: { x: 0, y: 0 }
      });
    }
  });
```

---

## Rate Limiting

Worker API endpoints are rate-limited to **100 requests per hour per IP**.

**Response on rate limit:**
```json
{
  "error": "Rate limit exceeded"
}
```

**Status Code:** `429 Too Many Requests`

---

## Error Responses

All API errors follow this format:

```json
{
  "error": "Error message here",
  "details": "Optional detailed error information"
}
```

**Common Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Webhooks

Future feature: Webhooks for project events.

---

## SDK Usage Examples

### TypeScript Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Create project
const { data: project } = await supabase
  .from('projects')
  .insert({ name: 'New Project' })
  .select()
  .single();
```

---

## Support

For API issues or questions:
- **GitHub Issues**: https://github.com/bedwards/interior-systems/issues
- **Documentation**: https://github.com/bedwards/interior-systems/tree/main/docs