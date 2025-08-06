/**
 * Cloudflare Images Configuration Validator
 * Validates and provides helpful error messages for Cloudflare Images setup
 */

export interface CloudflareImagesConfig {
  accountId: string;
  token: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: CloudflareImagesConfig;
}

/**
 * Validate Cloudflare Images configuration from environment variables
 */
export function validateCloudflareImagesConfig(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;

  // Check required fields
  if (!accountId) {
    errors.push('CLOUDFLARE_ACCOUNT_ID is required. Get this from your Cloudflare dashboard.');
  } else if (accountId === 'your-cloudflare-account-id') {
    errors.push('CLOUDFLARE_ACCOUNT_ID contains placeholder value - please set your actual account ID');
  }

  if (!token) {
    errors.push('CLOUDFLARE_IMAGES_TOKEN is required. Create an API token with Cloudflare Images permissions.');
  } else if (token === 'your-cloudflare-images-token') {
    errors.push('CLOUDFLARE_IMAGES_TOKEN contains placeholder value - please set your actual API token');
  }

  const valid = errors.length === 0;
  const config = valid ? {
    accountId: accountId!,
    token: token!
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
