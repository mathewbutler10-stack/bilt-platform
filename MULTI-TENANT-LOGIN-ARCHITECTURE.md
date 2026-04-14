# BILT Platform Multi-Tenant Login Architecture

## Problem Statement
"How will one of our 100s of customers log in now? If supabase isn't attached"

## Current Architecture Issue
The current implementation uses hardcoded Supabase values, which means:
1. **All customers share the same database** - No data isolation
2. **Single Supabase project** - Can't scale to hundreds of customers
3. **No tenant separation** - Security and data privacy concerns

## Solution: Multi-Tenant Architecture

### Option 1: Database-Level Multi-Tenancy (Recommended)
```
Single Supabase Project + Row-Level Security (RLS) + Tenant ID
```

**How it works:**
1. Each customer (gym/PT) gets a unique `tenant_id`
2. All database tables include `tenant_id` column
3. Row-Level Security (RLS) policies enforce data isolation
4. Single Supabase project, multiple isolated datasets

**Implementation:**
```sql
-- Example RLS policy
CREATE POLICY "Users can only access their own tenant data"
ON profiles FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id')::uuid
);
```

### Option 2: Project-Level Multi-Tenancy
```
Multiple Supabase Projects (one per customer)
```

**How it works:**
1. Each customer gets their own Supabase project
2. Complete data isolation at the database level
3. More complex to manage but maximum security

### Option 3: Schema-Level Multi-Tenancy
```
Single Database + Multiple Schemas (one per tenant)
```

**How it works:**
1. Each tenant gets their own PostgreSQL schema
2. Shared Supabase project, separate schemas
3. Good isolation, moderate complexity

## Recommended Implementation (Option 1)

### 1. Database Schema Updates
```sql
-- Add tenant_id to all tables
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- ... repeat for all tables

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

### 2. Authentication Flow
```
Customer Signup → Create Tenant → Create Admin User → Login
```

**Signup Process:**
1. Customer signs up at `bilt.com/signup`
2. System creates new tenant record
3. Creates admin user with `tenant_id`
4. Redirects to tenant-specific subdomain: `gym-name.bilt.com`

### 3. Login Flow with Tenant Context
```typescript
// Enhanced login function
export async function signInWithTenant(email: string, password: string, tenantId: string) {
  // 1. Set tenant context
  await supabase.rpc('set_current_tenant', { tenant_id: tenantId });
  
  // 2. Authenticate user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // 3. Verify user belongs to this tenant
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', data.user.id)
      .single();
      
    if (profile.tenant_id !== tenantId) {
      await supabase.auth.signOut();
      throw new Error('User does not belong to this tenant');
    }
  }
  
  return { data, error };
}
```

### 4. Subdomain Routing
```
https://acme-gym.bilt.com → Tenant ID: acme-gym
https://fitness-plus.bilt.com → Tenant ID: fitness-plus
```

**Middleware Implementation:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');
  
  // Extract subdomain
  const subdomain = hostname?.split('.')[0];
  
  if (subdomain && subdomain !== 'www' && subdomain !== 'bilt') {
    // Set tenant context
    const response = NextResponse.next();
    response.cookies.set('tenant_id', subdomain);
    return response;
  }
  
  return NextResponse.next();
}
```

## Immediate Fix for Current Deployment

### 1. Update Railway Environment Variables
The environment variables ARE set in Railway:
- `NEXT_PUBLIC_SUPABASE_URL`: ✅ Set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: ✅ Set

### 2. Redeploy with Updated Client
The robust client now:
1. **Prefers environment variables** (for production)
2. **Falls back to dev values** (for local development)
3. **Logs which mode it's using**

### 3. Test Login Flow
After redeployment, test:
1. Go to: `https://bilt-prod-production.up.railway.app/auth/login`
2. Use: `owner@bilt.com` / `password123`
3. Should redirect to dashboard

## Production-Ready Multi-Tenant Implementation Timeline

### Phase 1: Foundation (1-2 days)
1. Add `tenant_id` to all tables
2. Implement RLS policies
3. Create tenant management UI
4. Update authentication flow

### Phase 2: Subdomain Support (1 day)
1. Configure wildcard DNS (`*.bilt.com`)
2. Implement subdomain routing middleware
3. Create tenant onboarding flow

### Phase 3: Scaling (Ongoing)
1. Database performance optimization
2. Tenant data export/import
3. Billing integration per tenant
4. Analytics per tenant

## Current Status
✅ **Environment variables configured** in Railway
✅ **Robust client updated** to use environment variables
🔄 **Deployment in progress** with updated code
🔜 **Multi-tenant architecture ready** for implementation

## Next Steps
1. **Wait for deployment to complete** (5-10 minutes)
2. **Test login functionality** with environment variables
3. **Begin Phase 1 implementation** for true multi-tenancy
4. **Prepare for hundreds of customers** with proper isolation

## Technical Requirements for 100+ Customers
1. **Database**: PostgreSQL with proper indexing on `tenant_id`
2. **Caching**: Redis for session management
3. **CDN**: For static assets across subdomains
4. **Monitoring**: Per-tenant usage analytics
5. **Backup**: Per-tenant backup strategy

This architecture ensures:
- **Data isolation** between customers
- **Scalability** to hundreds/thousands of tenants
- **Security** through RLS policies
- **Performance** with proper indexing
- **Maintainability** with clean separation