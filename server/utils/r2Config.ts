/**
 * Cloudflare R2 Configuration Validator
 * Validates and provides helpful error messages for R2 setup
 */

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface R2ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: R2Config;
}

/**
 * Validate R2 configuration from environment variables
 */
export function validateR2Config(): R2ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  // Check required fields
  if (!endpoint) {
    errors.push('CLOUDFLARE_R2_ENDPOINT is required. Format: https://account-id.r2.cloudflarestorage.com');
  } else if (!endpoint.includes('.r2.cloudflarestorage.com')) {
    errors.push('CLOUDFLARE_R2_ENDPOINT must be a valid R2 endpoint URL');
  }

  if (!accessKeyId) {
    errors.push('CLOUDFLARE_R2_ACCESS_KEY_ID is required');
  } else if (accessKeyId === 'your-access-key-id') {
    errors.push('CLOUDFLARE_R2_ACCESS_KEY_ID contains placeholder value - please set your actual access key');
  }

  if (!secretAccessKey) {
    errors.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY is required');
  } else if (secretAccessKey === 'your-secret-access-key') {
    errors.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY contains placeholder value - please set your actual secret key');
  }

  if (!bucketName) {
    errors.push('CLOUDFLARE_R2_BUCKET_NAME is required');
  }

  // Warnings
  if (!publicUrl) {
    warnings.push('CLOUDFLARE_R2_PUBLIC_URL not set - using default R2.dev URLs');
  }

  if (bucketName && !bucketName.includes('-dev') && !bucketName.includes('-staging') && process.env.NODE_ENV !== 'production') {
    warnings.push('Consider using environment-specific bucket names (e.g., bucket-name-dev)');
  }

  const valid = errors.length === 0;
  const config = valid ? {
    endpoint: endpoint!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketName: bucketName!,
    publicUrl
  } : undefined;

  return {
    valid,
    errors,
    warnings,
    config
  };
}

/**
 * Get R2 configuration status for debugging
 */
export function getR2Status(): {
  configured: boolean;
  message: string;
  helpUrl: string;
} {
  const validation = validateR2Config();

  if (validation.valid) {
    return {
      configured: true,
      message: `R2 configured successfully. Bucket: ${validation.config!.bucketName}`,
      helpUrl: '/docs/cloudflare-r2-setup.md'
    };
  }

  if (validation.errors.length > 0) {
    return {
      configured: false,
      message: `R2 configuration errors: ${validation.errors.join(', ')}`,
      helpUrl: '/docs/cloudflare-r2-setup.md'
    };
  }

  return {
    configured: false,
    message: 'R2 not configured - photos will use local placeholders',
    helpUrl: '/docs/cloudflare-r2-setup.md'
  };
}

/**
 * Log R2 configuration status on server start
 */
export function logR2Status(): void {
  const validation = validateR2Config();
  
  console.log('\n📸 Photo Storage Configuration:');
  console.log('================================');
  
  if (validation.valid) {
    console.log('✅ Cloudflare R2 configured successfully');
    console.log(`📦 Bucket: ${validation.config!.bucketName}`);
    console.log(`🌐 Endpoint: ${validation.config!.endpoint}`);
    if (validation.config!.publicUrl) {
      console.log(`🔗 Public URL: ${validation.config!.publicUrl}`);
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => console.log(`   ${warning}`));
    }
  } else {
    console.log('❌ Cloudflare R2 not configured');
    console.log('📝 Photos will use local placeholders');
    console.log('\n🔧 Configuration errors:');
    validation.errors.forEach(error => console.log(`   • ${error}`));
    console.log('\n📖 Setup guide: docs/cloudflare-r2-setup.md');
    console.log('🛠️  Quick setup: npm run setup:r2');
  }
  console.log('================================\n');
}

/**
 * Generate example environment variables
 */
export function generateExampleEnv(): string {
  return `
# Cloudflare R2 Photo Storage Configuration
# Get these values from your Cloudflare dashboard

# Required: Your R2 endpoint (replace with your account ID)
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Required: R2 API credentials
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key

# Required: Bucket name
CLOUDFLARE_R2_BUCKET_NAME=wee-adventure-photos

# Optional: Custom domain for photos
CLOUDFLARE_R2_PUBLIC_URL=https://photos.your-domain.com

# Setup Guide: docs/cloudflare-r2-setup.md
`.trim();
}
