import { checkSupabaseHealth, config } from '@/lib/supabase/robust-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const health = await checkSupabaseHealth()
    
    const response = {
      timestamp: new Date().toISOString(),
      service: 'BILT Platform',
      version: '1.0.0',
      
      // Environment variables
      environmentVariables: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (hidden)' : '❌ Missing',
        NODE_ENV: process.env.NODE_ENV || 'not set',
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT_NAME || 'not set'
      },
      
      // Supabase health
      supabaseHealth: health,
      
      // Configuration
      config,
      
      // Recommendations
      recommendations: [] as string[]
    }
    
    // Generate recommendations
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      response.recommendations.push(
        'Set NEXT_PUBLIC_SUPABASE_URL in Railway environment variables',
        'Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Railway environment variables',
        'Redeploy after setting variables'
      )
    }
    
    if (!health.connected) {
      response.recommendations.push(
        'Check Supabase CORS settings - add Railway domain',
        'Verify Supabase project is active',
        'Check network connectivity'
      )
    }
    
    if (health.usingFallback) {
      response.recommendations.push(
        '⚠️ Using hardcoded fallback values - fix environment variables',
        'Application will work but should use proper environment variables'
      )
    }
    
    // Railway-specific info
    const railwayInfo = {
      deploymentUrl: 'https://bilt-prod-production.up.railway.app',
      projectId: 'c7779a37-f340-4bcd-b353-426c8e4a565a',
      serviceId: 'e5878938-9eb4-4786-bc16-aa85a60c0691'
    }
    
    return NextResponse.json({
      ...response,
      railwayInfo,
      diagnosticUrl: `${railwayInfo.deploymentUrl}/api/env-check`,
      loginUrl: `${railwayInfo.deploymentUrl}/auth/login`,
      status: health.connected ? 'operational' : 'degraded'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      status: 'error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'