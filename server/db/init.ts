import { readFileSync } from 'fs';
import { join } from 'path';
import { db, testDatabaseConnection } from './config.js';
import { storage } from '../lib/storage.js';

export async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Test connections first
    const dbConnected = await testDatabaseConnection();
    const minioConnected = await testMinioConnection();
    
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    if (!minioConnected) {
      throw new Error('Minio connection failed');
    }
    
    // Read and execute schema
    const schemaPath = join(process.cwd(), 'server/db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    await db.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Initialize Minio bucket
    await initializeMinio();
    
    console.log('🎉 Database and storage initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
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
