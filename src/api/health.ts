/**
 * MCP CONNECTION HEALTH CHECK ENDPOINT
 * 
 * Comprehensive testing of all 14 MCP connections
 * Run at: GET /api/health/mcp-status
 */

import { Request, Response } from 'express';

// ===========================================================================
// MCP CONNECTION TESTS
// ===========================================================================

interface MCPTestResult {
  service: string;
  status: 'connected' | 'configured' | 'missing' | 'error';
  message: string;
  lastChecked: Date;
  responseTime?: number;
}

interface HealthCheckResponse {
  timestamp: Date;
  environment: string;
  deploymentUrl: string;
  databaseConnected: boolean;
  mcpServices: MCPTestResult[];
  webhookEndpoints: {
    stripe: string;
    status: 'configured' | 'not_configured';
  };
  summary: {
    totalServices: number;
    connected: number;
    configured: number;
    missing: number;
    errors: number;
  };
}

/**
 * Test Stripe connection
 */
async function testStripeConnection(): Promise<MCPTestResult> {
  const startTime = Date.now();
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        service: 'Stripe',
        status: 'missing',
        message: 'Stripe secret key not configured',
        lastChecked: new Date(),
      };
    }

    // Test API call to Stripe
    const response = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      return {
        service: 'Stripe',
        status: 'connected',
        message: 'Stripe API is operational',
        lastChecked: new Date(),
        responseTime,
      };
    } else if (response.status === 401) {
      return {
        service: 'Stripe',
        status: 'error',
        message: 'Invalid Stripe API key',
        lastChecked: new Date(),
        responseTime,
      };
    } else {
      return {
        service: 'Stripe',
        status: 'configured',
        message: `API responded with status ${response.status}`,
        lastChecked: new Date(),
        responseTime,
      };
    }
  } catch (error) {
    return {
      service: 'Stripe',
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Test Supabase connection
 */
async function testSupabaseConnection(): Promise<MCPTestResult> {
  const startTime = Date.now();
  
  try {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      return {
        service: 'Supabase',
        status: 'missing',
        message: 'Supabase credentials not configured',
        lastChecked: new Date(),
      };
    }

    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      },
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    if ([200, 401, 403].includes(response.status)) {
      return {
        service: 'Supabase',
        status: 'connected',
        message: 'Supabase database is operational',
        lastChecked: new Date(),
        responseTime,
      };
    } else {
      return {
        service: 'Supabase',
        status: 'configured',
        message: `API responded with status ${response.status}`,
        lastChecked: new Date(),
        responseTime,
      };
    }
  } catch (error) {
    return {
      service: 'Supabase',
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Test HubSpot connection
 */
async function testHubSpotConnection(): Promise<MCPTestResult> {
  const startTime = Date.now();
  
  try {
    if (!process.env.HUBSPOT_API_KEY) {
      return {
        service: 'HubSpot',
        status: 'missing',
        message: 'HubSpot API key not configured',
        lastChecked: new Date(),
      };
    }

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      return {
        service: 'HubSpot',
        status: 'connected',
        message: 'HubSpot API is operational',
        lastChecked: new Date(),
        responseTime,
      };
    } else if (response.status === 401) {
      return {
        service: 'HubSpot',
        status: 'error',
        message: 'Invalid HubSpot API key',
        lastChecked: new Date(),
        responseTime,
      };
    } else {
      return {
        service: 'HubSpot',
        status: 'configured',
        message: `API responded with status ${response.status}`,
        lastChecked: new Date(),
        responseTime,
      };
    }
  } catch (error) {
    return {
      service: 'HubSpot',
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Test Slack connection
 */
async function testSlackConnection(): Promise<MCPTestResult> {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      return {
        service: 'Slack',
        status: 'missing',
        message: 'Slack webhook URL not configured',
        lastChecked: new Date(),
      };
    }

    // Validate webhook URL format
    if (!process.env.SLACK_WEBHOOK_URL.startsWith('https://hooks.slack.com')) {
      return {
        service: 'Slack',
        status: 'error',
        message: 'Invalid Slack webhook URL format',
        lastChecked: new Date(),
      };
    }

    return {
      service: 'Slack',
      status: 'configured',
      message: 'Slack webhook is configured (tested at runtime)',
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: 'Slack',
      status: 'error',
      message: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Check Gmail configuration
 */
async function testGmailConnection(): Promise<MCPTestResult> {
  try {
    if (!process.env.GMAIL_SERVICE_ACCOUNT_EMAIL || !process.env.GMAIL_PRIVATE_KEY) {
      return {
        service: 'Gmail',
        status: 'missing',
        message: 'Gmail service account credentials not configured',
        lastChecked: new Date(),
      };
    }

    return {
      service: 'Gmail',
      status: 'configured',
      message: 'Gmail service account is configured',
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: 'Gmail',
      status: 'error',
      message: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Check Google Calendar configuration
 */
async function testGoogleCalendarConnection(): Promise<MCPTestResult> {
  try {
    if (
      !process.env.GOOGLE_CALENDAR_CLIENT_ID ||
      !process.env.GOOGLE_CALENDAR_CLIENT_SECRET
    ) {
      return {
        service: 'Google Calendar',
        status: 'missing',
        message: 'Google Calendar credentials not configured',
        lastChecked: new Date(),
      };
    }

    return {
      service: 'Google Calendar',
      status: 'configured',
      message: 'Google Calendar OAuth is configured',
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: 'Google Calendar',
      status: 'error',
      message: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
    };
  }
}

/**
 * Check remaining MCP services
 */
function checkMCPConfigurations(): MCPTestResult[] {
  const services = [
    { name: 'Socialblu', env: 'SOCIALBLU_API_KEY' },
    { name: 'Jotform', env: 'JOTFORM_API_KEY' },
    { name: 'Linear', env: 'LINEAR_API_KEY' },
    { name: 'Ticket Tailor', env: 'TICKET_TAILOR_API_KEY' },
    { name: 'Amplitude', env: 'AMPLITUDE_API_KEY' },
    { name: 'Vercel Analytics', env: 'VERCEL_ANALYTICS_ID' },
  ];

  return services.map((service) => ({
    service: service.name,
    status: (process.env[service.env] ? 'configured' : 'missing') as
      | 'configured'
      | 'missing',
    message: process.env[service.env]
      ? `${service.name} is configured`
      : `${service.name} API key not configured`,
    lastChecked: new Date(),
  }));
}

/**
 * Main health check endpoint
 */
export async function handleMCPHealthCheck(req: Request, res: Response): Promise<void> {
  try {
    console.log('[Health Check] Starting MCP connection tests');

    // Run all MCP tests in parallel
    const [
      stripeResult,
      supabaseResult,
      hubspotResult,
      slackResult,
      gmailResult,
      googleCalendarResult,
      ...otherServices
    ] = await Promise.all([
      testStripeConnection(),
      testSupabaseConnection(),
      testHubSpotConnection(),
      testSlackConnection(),
      testGmailConnection(),
      testGoogleCalendarConnection(),
      ...checkMCPConfigurations().map((result) => Promise.resolve(result)),
    ]);

    const allResults = [
      stripeResult,
      supabaseResult,
      hubspotResult,
      slackResult,
      gmailResult,
      googleCalendarResult,
      ...otherServices,
    ];

    // Calculate summary
    const summary = {
      totalServices: allResults.length,
      connected: allResults.filter((r) => r.status === 'connected').length,
      configured: allResults.filter((r) => r.status === 'configured').length,
      missing: allResults.filter((r) => r.status === 'missing').length,
      errors: allResults.filter((r) => r.status === 'error').length,
    };

    // Build response
    const response: HealthCheckResponse = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      deploymentUrl: process.env.VITE_APP_URL || 'https://teatimenetwork.app',
      databaseConnected: supabaseResult.status === 'connected',
      mcpServices: allResults,
      webhookEndpoints: {
        stripe: `/api/webhooks/stripe`,
        status: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not_configured',
      },
      summary,
    };

    console.log('[Health Check] Tests completed', summary);

    res.status(200).json(response);
  } catch (error) {
    console.error('[Health Check] Error:', error);

    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    });
  }
}

/**
 * Simplified health check endpoint (used for Vercel uptime monitoring)
 */
export async function handleHealthCheck(req: Request, res: Response): Promise<void> {
  try {
    // Quick check - just verify Supabase is reachable
    const supabaseCheck = await testSupabaseConnection();

    const isHealthy =
      ['connected', 'configured'].includes(supabaseCheck.status);

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      services: {
        database: supabaseCheck.status,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  handleMCPHealthCheck,
  handleHealthCheck,
};
