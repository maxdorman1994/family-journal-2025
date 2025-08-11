// Database service to replace Supabase
import { db } from '../../server/db/config.js';

// Types from the old Supabase setup
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  weather: string;
  mood: string;
  miles_traveled: number;
  parking: string;
  dog_friendly: boolean;
  paid_activity: boolean;
  adult_tickets: string;
  child_tickets: string;
  other_tickets: string;
  pet_notes: string;
  tags: string[];
  photos: string[]; // Minio URLs
  created_at?: string;
  updated_at?: string;
}

export interface ProcessedPhoto {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  isProcessing: boolean;
  uploadProgress: number;
  cloudflareUrl?: string; // Now Minio URL
  error?: string;
}

// Database query helper with similar interface to Supabase
export class DatabaseClient {
  constructor(private tableName: string) {}

  // SELECT operations
  select(columns: string = '*') {
    return new DatabaseQuery(this.tableName, 'SELECT', columns);
  }

  // INSERT operations
  insert(data: any) {
    return new DatabaseQuery(this.tableName, 'INSERT', '', data);
  }

  // UPDATE operations
  update(data: any) {
    return new DatabaseQuery(this.tableName, 'UPDATE', '', data);
  }

  // DELETE operations
  delete() {
    return new DatabaseQuery(this.tableName, 'DELETE');
  }

  // RPC operations (stored procedures)
  static async rpc(functionName: string, params: Record<string, any>) {
    try {
      const paramNames = Object.keys(params);
      const paramValues = Object.values(params);
      const paramPlaceholders = paramNames.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;
      const result = await db.query(query, paramValues);
      
      return { data: result.rows, error: null };
    } catch (error) {
      console.error(`RPC ${functionName} error:`, error);
      return { data: null, error };
    }
  }
}

class DatabaseQuery {
  private whereConditions: string[] = [];
  private orderByClause: string = '';
  private limitClause: string = '';
  private offsetClause: string = '';
  private selectColumns: string = '*';
  private insertData: any = null;
  private updateData: any = null;
  private headOnly: boolean = false;
  private countOption: string | null = null;

  constructor(
    private tableName: string, 
    private operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    columns: string = '*',
    data: any = null
  ) {
    this.selectColumns = columns;
    this.insertData = data;
    this.updateData = data;
  }

  // Add WHERE conditions
  eq(column: string, value: any) {
    this.whereConditions.push(`${column} = '${value}'`);
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push(`${column} != '${value}'`);
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push(`${column} > '${value}'`);
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push(`${column} >= '${value}'`);
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push(`${column} < '${value}'`);
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push(`${column} <= '${value}'`);
    return this;
  }

  like(column: string, pattern: string) {
    this.whereConditions.push(`${column} LIKE '${pattern}'`);
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions.push(`${column} ILIKE '${pattern}'`);
    return this;
  }

  in(column: string, values: any[]) {
    const valueList = values.map(v => `'${v}'`).join(', ');
    this.whereConditions.push(`${column} IN (${valueList})`);
    return this;
  }

  is(column: string, value: any) {
    if (value === null) {
      this.whereConditions.push(`${column} IS NULL`);
    } else {
      this.whereConditions.push(`${column} IS '${value}'`);
    }
    return this;
  }

  // Add ORDER BY
  order(column: string, options: { ascending?: boolean } = { ascending: true }) {
    const direction = options.ascending !== false ? 'ASC' : 'DESC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  // Add LIMIT
  limit(count: number) {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }

  // Add OFFSET  
  range(from: number, to: number) {
    this.offsetClause = `OFFSET ${from}`;
    this.limitClause = `LIMIT ${to - from + 1}`;
    return this;
  }

  // Count option
  select(columns: string, options?: { count?: 'exact' | 'estimated', head?: boolean }) {
    this.selectColumns = columns;
    if (options?.count) {
      this.countOption = options.count;
    }
    if (options?.head) {
      this.headOnly = true;
    }
    return this;
  }

  // Execute the query
  async execute(): Promise<{ data: any, error: any, count?: number }> {
    try {
      let query = '';
      let values: any[] = [];

      switch (this.operation) {
        case 'SELECT':
          if (this.countOption) {
            query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
          } else if (this.headOnly) {
            query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
          } else {
            query = `SELECT ${this.selectColumns} FROM ${this.tableName}`;
          }
          break;

        case 'INSERT':
          if (Array.isArray(this.insertData)) {
            // Multiple inserts
            const firstItem = this.insertData[0];
            const columns = Object.keys(firstItem);
            const columnsList = columns.join(', ');
            
            const valuesArray = this.insertData.map((item, itemIndex) => {
              const itemValues = columns.map((col, colIndex) => {
                const paramIndex = itemIndex * columns.length + colIndex + 1;
                values.push(item[col]);
                return `$${paramIndex}`;
              });
              return `(${itemValues.join(', ')})`;
            });
            
            query = `INSERT INTO ${this.tableName} (${columnsList}) VALUES ${valuesArray.join(', ')} RETURNING *`;
          } else {
            // Single insert
            const columns = Object.keys(this.insertData);
            const columnsList = columns.join(', ');
            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
            values = Object.values(this.insertData);
            query = `INSERT INTO ${this.tableName} (${columnsList}) VALUES (${placeholders}) RETURNING *`;
          }
          break;

        case 'UPDATE':
          const updateColumns = Object.keys(this.updateData);
          const updateSetClause = updateColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');
          values = Object.values(this.updateData);
          query = `UPDATE ${this.tableName} SET ${updateSetClause}`;
          break;

        case 'DELETE':
          query = `DELETE FROM ${this.tableName}`;
          break;
      }

      // Add WHERE conditions
      if (this.whereConditions.length > 0) {
        query += ` WHERE ${this.whereConditions.join(' AND ')}`;
      }

      // Add ORDER BY
      if (this.orderByClause && this.operation === 'SELECT') {
        query += ` ${this.orderByClause}`;
      }

      // Add LIMIT and OFFSET
      if (this.limitClause && this.operation === 'SELECT') {
        query += ` ${this.limitClause}`;
      }
      if (this.offsetClause && this.operation === 'SELECT') {
        query += ` ${this.offsetClause}`;
      }

      // Add RETURNING for UPDATE/DELETE
      if (this.operation === 'UPDATE' || this.operation === 'DELETE') {
        query += ' RETURNING *';
      }

      console.log('Executing query:', query, 'with values:', values);
      const result = await db.query(query, values);
      
      if (this.countOption || this.headOnly) {
        return { 
          data: this.headOnly ? null : result.rows, 
          error: null, 
          count: parseInt(result.rows[0]?.count || '0') 
        };
      }

      return { data: result.rows, error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
  }
}

// Create table clients similar to Supabase interface
export const database = {
  from: (tableName: string) => new DatabaseClient(tableName),
  rpc: DatabaseClient.rpc
};

// Configuration check functions
export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_HOST && 
    process.env.DATABASE_NAME && 
    process.env.DATABASE_USER
  );
}

export function getDatabaseStatus(): {
  configured: boolean;
  message: string;
  host?: string;
} {
  if (!isDatabaseConfigured()) {
    return {
      configured: false,
      message: "Database not configured. Please set DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD environment variables.",
    };
  }

  return {
    configured: true,
    message: "Database configured successfully",
    host: process.env.DATABASE_HOST,
  };
}
