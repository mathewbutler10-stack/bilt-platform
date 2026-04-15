import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    deployment: 'BILT Platform',
    version: '1.0.0',
    build: '2026-04-16-night',
    features: [
      'Static Gym Dashboard (/gym/static)',
      'Simple Gym Dashboard (/gym/simple)',
      'Main Gym Dashboard (/gym/dashboard)',
      'Health Monitoring (/api/health)',
      'Environment Check (/api/env-check)'
    ],
    status: 'operational',
    lastCommit: 'Add static gym dashboard that always works',
    commitHash: '4ad5f0b'
  })
}

export const dynamic = 'force-dynamic'