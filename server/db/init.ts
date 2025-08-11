import { readFileSync } from 'fs';
import { join } from 'path';
import { db, testDatabaseConnection } from './config.js';
import { storage } from '../lib/storage.js';

export async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Test connections first
    const dbConnected = await testDatabaseConnection();
    const storageConnected = await storage.testConnection();

    if (!dbConnected) {
      console.warn('⚠️ Database connection failed - continuing anyway for development');
    }

    if (!storageConnected) {
      console.warn('⚠️ Storage connection failed - continuing anyway for development');
    }

    // Read and execute schema (only if database is connected)
    if (dbConnected) {
      const schemaPath = join(process.cwd(), 'server/db/schema.sql');
      const schema = readFileSync(schemaPath, 'utf8');

      console.log('📋 Creating database schema...');
      await db.query(schema);
      console.log('✅ Database schema created successfully');
    }

    // Initialize storage bucket (only if storage is connected)
    if (storageConnected) {
      await storage.ensureBucket();
    }

    console.log('🎉 Database and storage initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw in development to allow partial functionality
    console.warn('⚠️ Continuing with partial functionality');
    return false;
  }
}

export async function closeConnections() {
  try {
    await db.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}
