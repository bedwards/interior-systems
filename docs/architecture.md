# Interior Systems Architecture

## System Overview

Interior Systems is a full-stack, serverless web application that provides data-driven interior design intelligence. The architecture is built on three main pillars:

1. **Frontend**: React SPA hosted on GitHub Pages
2. **Backend**: Supabase (PostgreSQL + Realtime + Storage + Auth)
3. **Edge Layer**: Cloudflare Workers for compute and AI

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   React    │  │  IndexedDB  │  │  Service Worker      │ │
│  │   (Vite)   │  │  (Offline)  │  │  (PWA)               │ │
│  └────────────┘  └─────────────┘  └──────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS / WebSocket
                       │
        ┌──────────────┼──────────────┐
        │              │               │
        ▼              ▼               ▼
┌──────────────┐ ┌──────────┐  ┌──────────────┐
│   GitHub     │ │ Supabase │  │  Cloudflare  │
│    Pages     │ │          │  │   Workers    │
│              │ │  - Auth  │  │              │
│  - Static    │ │  - DB    │  │  - AI        │
│  - Assets    │ │  - RT    │  │  - Compute   │
│  - HTML/JS   │ │  - Store │  │  - Cron      │
└──────────────┘ └──────────┘  └──────────────┘
```

## Component Breakdown

### Frontend (React + Vite)

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Zustand for state management
- Fabric.js for canvas manipulation
- Chart.js for data visualization
- PWA with service workers

**Key Features:**
- Responsive design with mobile support
- Real-time collaborative editing
- Offline-first with IndexedDB caching
- Delta-sync when reconnecting
- Canvas-based design workspace
- Analytics dashboard

**State Management:**
```typescript
Store Structure:
├── user (Auth state)
├── projects (User projects)
├── rooms (Project rooms)
├── objects (Design elements)
├── palettes (Color schemes)
├── isOnline (Network status)
└── syncQueue (Offline changes)
```

### Backend (Supabase)

**Database Schema:**

```sql
Tables:
├── user_profiles (User metadata)
├── projects (Design projects)
├── rooms (Spaces within projects)
├── objects (Design elements)
├── palettes (Color schemes)
├── materials (Surface materials)
├── vendors (Supplier information)
├── lighting_profiles (Lighting config)
├── collaborations (Multi-user access)
└── activity_log (Audit trail)

Materialized View:
└── project_metrics (Aggregated analytics)
```

**Row Level Security (RLS):**
- All tables secured with RLS policies
- Users can only access their own data
- Collaboration grants conditional access
- Service role bypasses RLS for Workers

**Realtime Features:**
- PostgreSQL changes broadcast via WebSocket
- Presence tracking for collaborative cursors
- Broadcast channels for ephemeral state

**Storage:**
- Public buckets for thumbnails
- Private buckets for project files
- Automatic image optimization
- CDN distribution

### Edge Layer (Cloudflare Workers)

**Worker Endpoints:**

```
POST /api/thumbnails
  - Generate image thumbnails
  - Resize and optimize

POST /api/palette-extract
  - Extract color palettes from images
  - Return dominant colors with percentages

POST /api/search
  - Semantic search using embeddings
  - Vector similarity search

POST /api/lighting-calc
  - Calculate lighting requirements
  - Recommend fixture counts

POST /api/sustainability
  - CO₂ footprint analysis
  - Sustainability scoring

GET /api/cron/refresh-vendors
  - Nightly vendor data sync
  - Update pricing and scores
```

**Middleware:**
- JWT validation (Supabase Auth)
- Rate limiting (KV Store)
- Error handling
- CORS configuration

**Workers AI:**
- Text embeddings for search
- Future: Image classification
- Future: Layout suggestions

**Scheduled Jobs:**
```typescript
Cron: "0 0 * * *" (Daily at midnight)
  - Refresh vendor pricing
  - Update sustainability scores
  - Clean up temporary files
```

## Data Flow

### Project Creation Flow

```
1. User submits form → Frontend
2. Validate input → Frontend
3. Check network → Store
   
   IF Online:
   4a. POST to Supabase → API
   5a. Insert row → Database
   6a. Return data → Frontend
   7a. Update UI → React
   8a. Cache locally → IndexedDB
   
   IF Offline:
   4b. Generate temp ID → Store
   5b. Save to IndexedDB → Cache
   6b. Add to sync queue → Store
   7b. Update UI → React
   8b. Sync when online → Background
```

### Realtime Collaboration Flow

```
1. User A modifies object → Canvas
2. Fabric.js event fired → Handler
3. Update Supabase → API
4. Database change → PostgreSQL
5. Realtime broadcast → All subscribers
6. User B receives update → WebSocket
7. Update canvas → Fabric.js
8. Show cursor position → Presence
```

### Offline Sync Flow

```
1. Network disconnects → Event
2. Set offline mode → Store
3. Queue operations → IndexedDB
4. Continue working → Local only

--- Network restores ---

5. Detect online → Event
6. Process queue → Sync service
7. Apply changes → Supabase
8. Clear queue → IndexedDB
9. Refresh data → Pull latest
```

## Security Architecture

### Authentication Flow

```
1. User signs in → Supabase Auth
2. Receive JWT → Client
3. Store in localStorage → Browser
4. Include in requests → Headers
5. Validate on Worker → Middleware
6. Verify signature → JWKS
7. Extract user_id → Payload
8. Execute query → Supabase
```

### Authorization Layers

1. **Frontend**: UI-level access control
2. **RLS Policies**: Database-level security
3. **Worker Validation**: API-level checks
4. **Network Security**: HTTPS only, CORS

### Data Privacy

- All data encrypted in transit (TLS)
- At-rest encryption (Supabase default)
- No third-party tracking
- User data ownership
- GDPR compliant

## Performance Optimizations

### Frontend

- Code splitting by route
- Lazy loading components
- Image lazy loading
- Virtual scrolling for lists
- Debounced canvas updates
- Memoized expensive computations

### Backend

- Database indexes on foreign keys
- Materialized views for analytics
- Connection pooling (PgBouncer)
- Query optimization

### Edge

- Worker cold start < 10ms
- KV caching for rate limits
- AI inference on edge
- CDN for static assets

### Caching Strategy

```
Browser Cache:
├── Static assets (1 year)
├── API responses (5 min)
└── User data (IndexedDB)

CDN Cache:
├── Images (1 week)
├── Thumbnails (1 month)
└── Fonts (1 year)

Worker KV:
├── Rate limits (1 hour)
└── Session data (24 hours)
```

## Scalability

### Current Limits

- **Users**: Unlimited (serverless)
- **Projects per user**: Unlimited
- **Concurrent users**: 500+ (Supabase free tier)
- **Storage**: 10 GB per user
- **API requests**: 100/hour per IP (rate limited)

### Scaling Strategy

1. **Horizontal Scaling**: Add more Workers (automatic)
2. **Database**: Upgrade Supabase tier
3. **Storage**: Add S3 or R2 backend
4. **CDN**: Already distributed globally

## Monitoring & Observability

### Metrics Tracked

- Page load time
- API response time
- Error rates
- User sessions
- Database queries
- Worker execution time

### Logging

- Frontend errors → Console
- Worker errors → Cloudflare Logs
- Database errors → Supabase Logs
- Activity log → Database table

### Alerts

- High error rate
- Slow queries (> 1s)
- Storage near limit
- Failed cron jobs

## Deployment Pipeline

### CI/CD Flow

```
1. Push to main → GitHub
2. Run tests → GitHub Actions
3. Check coverage → Codecov
4. Build frontend → Vite
5. Deploy to Pages → GitHub Pages
6. Build Worker → Wrangler
7. Deploy to Edge → Cloudflare
8. Smoke tests → Automated
```

### Rollback Strategy

1. GitHub Pages: Revert commit
2. Workers: Deploy previous version
3. Database: Restore from backup
4. Quick rollback < 5 minutes

## Future Enhancements

### Planned Features

- [ ] 3D visualization (Three.js)
- [ ] AR room preview (WebXR)
- [ ] ML-powered layout suggestions
- [ ] Advanced lighting simulation
- [ ] BIM/CAD file import
- [ ] Cost estimation AI
- [ ] Supply chain integration
- [ ] Sustainability certification

### Technical Debt

- [ ] Migrate to React Query
- [ ] Add E2E tests (Playwright)
- [ ] Improve error boundaries
- [ ] Add request deduplication
- [ ] Implement optimistic updates
- [ ] Add undo/redo stack

## Conclusion

This architecture provides a robust, scalable, and cost-effective solution for interior design intelligence. By leveraging serverless technologies and free-tier services, we democratize access to professional-grade design tools.