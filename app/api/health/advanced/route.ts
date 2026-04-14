import { supabase } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'

// Make this route dynamic - don't prerender during build
export const dynamic = 'force-dynamic'

// Cache health check results for 30 seconds
let cachedHealth: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function GET(request: Request) {
  const startTime = Date.now()
  
  // Check if Supabase client is available
  if (!supabase) {
    return NextResponse.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      checks: {
        supabase: {
          status: 'unhealthy',
          details: 'Supabase client not initialized - missing environment variables'
        }
      },
      message: 'Supabase configuration missing'
    }, { status: 503 })
  }
  
  // Check cache
  const now = Date.now()
  if (cachedHealth && (now - cacheTimestamp) < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedHealth,
      cached: true,
      cacheAge: now - cacheTimestamp,
    })
  }
  
  const checks: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy'
    duration?: number
    details?: any
  }> = {}
  
  try {
    // 1. Database Connection Check
    const dbStart = Date.now()
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1)
      const dbDuration = Date.now() - dbStart
      
      checks.database = {
        status: dbError ? 'unhealthy' : 'healthy',
        duration: dbDuration,
        details: dbError ? { error: dbError.message, code: dbError.code } : { connected: true },
      }
    } catch (dbError: any) {
      checks.database = {
        status: 'unhealthy',
        duration: Date.now() - dbStart,
        details: { error: dbError.message },
      }
    }
    
    // 2. Authentication Check (if service role key is available)
    const authStart = Date.now()
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      const authDuration = Date.now() - authStart
      
      checks.authentication = {
        status: authError ? 'degraded' : 'healthy',
        duration: authDuration,
        details: {
          hasSession: !!authData?.session,
          error: authError?.message,
        },
      }
    } catch (authError: any) {
      checks.authentication = {
        status: 'degraded',
        duration: Date.now() - authStart,
        details: { error: authError.message },
      }
    }
    
    // 3. Storage Check (if using Supabase Storage)
    const storageStart = Date.now()
    try {
      const { data: storageData, error: storageError } = await supabase.storage.listBuckets()
      const storageDuration = Date.now() - storageStart
      
      checks.storage = {
        status: storageError ? 'degraded' : 'healthy',
        duration: storageDuration,
        details: {
          buckets: storageData?.length || 0,
          error: storageError?.message,
        },
      }
    } catch (storageError: any) {
      checks.storage = {
        status: 'degraded',
        duration: Date.now() - storageStart,
        details: { error: storageError.message },
      }
    }
    
    // 4. Realtime Check (if using Supabase Realtime)
    const realtimeStart = Date.now()
    try {
      // Simple check - just verify we can create a channel
      const channel = supabase.channel('health-check')
      const realtimeDuration = Date.now() - realtimeStart
      
      checks.realtime = {
        status: 'healthy',
        duration: realtimeDuration,
        details: { channelCreated: true },
      }
      
      // Clean up
      channel.unsubscribe()
    } catch (realtimeError: any) {
      checks.realtime = {
        status: 'degraded',
        duration: Date.now() - realtimeStart,
        details: { error: realtimeError.message },
      }
    }
    
    // 5. Environment Check
    checks.environment = {
      status: process.env.NODE_ENV === 'production' ? 'healthy' : 'degraded',
      details: {
        nodeEnv: process.env.NODE_ENV,
        nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ? 'set' : 'not set',
        railwayEnvironment: process.env.RAILWAY_ENVIRONMENT || 'not set',
      },
    }
    
    // 6. System Resources Check
    const memoryUsage = process.memoryUsage()
    checks.system = {
      status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? 'healthy' : 'degraded',
      details: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        },
        uptime: process.uptime(),
      },
    }
    
    // 7. External Services Check (optional)
    const externalStart = Date.now()
    const externalChecks: Record<string, any> = {}
    
    // Check Stripe (if configured)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Simple check - just verify key format
        const isValid = process.env.STRIPE_SECRET_KEY.startsWith('sk_')
        externalChecks.stripe = {
          status: isValid ? 'healthy' : 'unhealthy',
          details: { configured: true, keyFormat: isValid ? 'valid' : 'invalid' },
        }
      } catch (stripeError: any) {
        externalChecks.stripe = {
          status: 'unhealthy',
          details: { error: stripeError.message },
        }
      }
    }
    
    // Check Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const isValid = process.env.RESEND_API_KEY.startsWith('re_')
        externalChecks.resend = {
          status: isValid ? 'healthy' : 'unhealthy',
          details: { configured: true, keyFormat: isValid ? 'valid' : 'invalid' },
        }
      } catch (resendError: any) {
        externalChecks.resend = {
          status: 'unhealthy',
          details: { error: resendError.message },
        }
      }
    }
    
    if (Object.keys(externalChecks).length > 0) {
      checks.external = {
        status: Object.values(externalChecks).every(c => c.status === 'healthy') ? 'healthy' : 'degraded',
        duration: Date.now() - externalStart,
        details: externalChecks,
      }
    }
    
    // Calculate overall status
    const allChecks = Object.values(checks)
    const unhealthyCount = allChecks.filter(c => c.status === 'unhealthy').length
    const degradedCount = allChecks.filter(c => c.status === 'degraded').length
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (unhealthyCount > 0) overallStatus = 'unhealthy'
    else if (degradedCount > 0) overallStatus = 'degraded'
    
    const totalDuration = Date.now() - startTime
    
    // Prepare response
    const healthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV,
      checks,
      summary: {
        total: allChecks.length,
        healthy: allChecks.filter(c => c.status === 'healthy').length,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
      },
    }
    
    // Cache the result
    cachedHealth = healthResponse
    cacheTimestamp = now
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 206 : 503
    
    return NextResponse.json(healthResponse, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Health-Check': overallStatus,
        'X-Response-Time': `${totalDuration}ms`,
      },
    })
    
  } catch (error: any) {
    // Global error handler
    const totalDuration = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Health-Check': 'unhealthy',
        'X-Response-Time': `${totalDuration}ms`,
      },
    })
  }
}

// Optional: Add HEAD method for load balancers
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'X-Health-Check': 'available',
    },
  })
}
