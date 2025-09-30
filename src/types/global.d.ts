// Global type declarations for the Gopher app

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_JWT_SECRET?: string;

    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    AI_PROVIDER?: 'openai' | 'anthropic';

    NEXT_PUBLIC_APP_URL: string;
    SESSION_SECRET: string;
    FEATURE_FLAGS?: string;

    REDIS_URL?: string;
    API_RATE_LIMIT_PER_MINUTE?: string;

    SENTRY_DSN?: string;
    VERCEL_ANALYTICS_ID?: string;
  }
}

// Utility: Brand type for nominal typing
type Brand<Base, Branding extends string> = Base & { readonly __brand: Branding };

// App-wide ID types (UUIDs branded for clarity)
type ConversationId = Brand<string, 'ConversationId'>;
type UserId = Brand<string, 'UserId'>;
type MessageId = Brand<string, 'MessageId'>;

// Ambient module declarations can be added here as needed.


