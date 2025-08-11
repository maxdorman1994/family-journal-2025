// Client-side database service that communicates with server via API
// This provides a Supabase-compatible interface for existing code

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

// API-based database client with Supabase-compatible interface
export class DatabaseClient {
  constructor(private tableName: string) {}

  // SELECT operations
  select(columns: string = "*") {
    return new DatabaseQuery(this.tableName, "SELECT", columns);
  }

  // INSERT operations
  insert(data: any) {
    return new DatabaseQuery(this.tableName, "INSERT", "", data);
  }

  // UPDATE operations
  update(data: any) {
    return new DatabaseQuery(this.tableName, "UPDATE", "", data);
  }

  // DELETE operations
  delete() {
    return new DatabaseQuery(this.tableName, "DELETE");
  }

  // RPC operations (stored procedures)
  static async rpc(functionName: string, params: Record<string, any>) {
    try {
      const response = await fetch("/api/database/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionName,
          params,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "RPC call failed");
      }

      const data = await response.json();
      return { data: data.result, error: null };
    } catch (error) {
      console.error(`RPC ${functionName} error:`, error);
      return { data: null, error };
    }
  }
}

class DatabaseQuery {
  private whereConditions: Record<string, any> = {};
  private orderByClause: string = "";
  private limitValue: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private selectColumns: string = "*";
  private insertData: any = null;
  private updateData: any = null;
  private headOnly: boolean = false;
  private countOption: string | null = null;

  constructor(
    private tableName: string,
    private operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
    columns: string = "*",
    data: any = null,
  ) {
    this.selectColumns = columns;
    this.insertData = data;
    this.updateData = data;
  }

  // Add WHERE conditions
  eq(column: string, value: any) {
    this.whereConditions[column + "_eq"] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions[column + "_neq"] = value;
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions[column + "_gt"] = value;
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions[column + "_gte"] = value;
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions[column + "_lt"] = value;
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions[column + "_lte"] = value;
    return this;
  }

  like(column: string, pattern: string) {
    this.whereConditions[column + "_like"] = pattern;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions[column + "_ilike"] = pattern;
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions[column + "_in"] = values;
    return this;
  }

  is(column: string, value: any) {
    this.whereConditions[column + "_is"] = value;
    return this;
  }

  // Add ORDER BY
  order(
    column: string,
    options: { ascending?: boolean } = { ascending: true },
  ) {
    const direction = options.ascending !== false ? "asc" : "desc";
    this.orderByClause = `${column}_${direction}`;
    return this;
  }

  // Add LIMIT
  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  // Add RANGE
  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  // Count option
  select(
    columns: string,
    options?: { count?: "exact" | "estimated"; head?: boolean },
  ) {
    this.selectColumns = columns;
    if (options?.count) {
      this.countOption = options.count;
    }
    if (options?.head) {
      this.headOnly = true;
    }
    return this;
  }

  // Single result method
  async single(): Promise<{ data: any; error: any }> {
    const result = await this.execute();
    if (result.error) {
      return result;
    }
    return {
      data: Array.isArray(result.data) ? result.data[0] || null : result.data,
      error: result.error,
    };
  }

  // Execute the query via API
  async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const queryParams = {
        table: this.tableName,
        operation: this.operation,
        columns: this.selectColumns,
        where: this.whereConditions,
        order: this.orderByClause,
        limit: this.limitValue,
        rangeFrom: this.rangeFrom,
        rangeTo: this.rangeTo,
        data: this.insertData || this.updateData,
        count: this.countOption,
        head: this.headOnly,
      };

      const response = await fetch("/api/database/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Database query failed");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Database query failed"),
      };
    }
  }
}

// Create table clients similar to Supabase interface
export const database = {
  from: (tableName: string) => new DatabaseClient(tableName),
  rpc: DatabaseClient.rpc,
};

// Configuration check functions
export function isDatabaseConfigured(): boolean {
  // This will be checked server-side via API
  return true; // Assume configured for client
}

export async function getDatabaseStatus(): Promise<{
  configured: boolean;
  message: string;
  host?: string;
}> {
  try {
    const response = await fetch("/api/database/status");

    if (!response.ok) {
      throw new Error("Failed to get database status");
    }

    return await response.json();
  } catch (error) {
    return {
      configured: false,
      message: "Failed to check database configuration",
    };
  }
}
