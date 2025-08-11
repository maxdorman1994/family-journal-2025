import { RequestHandler } from "express";
import { db } from "../db/config.js";

/**
 * Execute database queries via API
 */
export const executeQuery: RequestHandler = async (req, res) => {
  try {
    const {
      table,
      operation,
      columns = '*',
      where = {},
      order,
      limit,
      rangeFrom,
      rangeTo,
      data,
      count,
      head
    } = req.body;

    if (!table || !operation) {
      return res.status(400).json({ error: "Table and operation are required" });
    }

    let query = '';
    let values: any[] = [];
    let paramCount = 0;

    // Build WHERE clause
    const buildWhereClause = (whereConditions: Record<string, any>) => {
      const conditions: string[] = [];
      
      Object.entries(whereConditions).forEach(([key, value]) => {
        const [column, operator] = key.split('_');
        paramCount++;
        
        switch (operator) {
          case 'eq':
            conditions.push(`${column} = $${paramCount}`);
            values.push(value);
            break;
          case 'neq':
            conditions.push(`${column} != $${paramCount}`);
            values.push(value);
            break;
          case 'gt':
            conditions.push(`${column} > $${paramCount}`);
            values.push(value);
            break;
          case 'gte':
            conditions.push(`${column} >= $${paramCount}`);
            values.push(value);
            break;
          case 'lt':
            conditions.push(`${column} < $${paramCount}`);
            values.push(value);
            break;
          case 'lte':
            conditions.push(`${column} <= $${paramCount}`);
            values.push(value);
            break;
          case 'like':
            conditions.push(`${column} LIKE $${paramCount}`);
            values.push(value);
            break;
          case 'ilike':
            conditions.push(`${column} ILIKE $${paramCount}`);
            values.push(value);
            break;
          case 'in':
            const placeholders = value.map((_: any, index: number) => {
              paramCount++;
              values.push(value[index]);
              return `$${paramCount}`;
            });
            conditions.push(`${column} IN (${placeholders.join(', ')})`);
            break;
          case 'is':
            if (value === null) {
              conditions.push(`${column} IS NULL`);
            } else {
              conditions.push(`${column} IS $${paramCount}`);
              values.push(value);
            }
            break;
          default:
            // Handle direct column = value
            conditions.push(`${key} = $${paramCount}`);
            values.push(value);
            break;
        }
      });
      
      return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    };

    // Build query based on operation
    switch (operation) {
      case 'SELECT':
        if (count || head) {
          query = `SELECT COUNT(*) as count FROM ${table}`;
        } else {
          query = `SELECT ${columns} FROM ${table}`;
        }
        
        // Add WHERE clause
        const whereClause = buildWhereClause(where);
        if (whereClause) {
          query += ` ${whereClause}`;
        }
        
        // Add ORDER BY
        if (order && !count && !head) {
          const [column, direction] = order.split('_');
          query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
        }
        
        // Add LIMIT and OFFSET
        if (limit && !count && !head) {
          query += ` LIMIT ${limit}`;
        }
        if (rangeFrom !== null && rangeTo !== null && !count && !head) {
          query += ` OFFSET ${rangeFrom} LIMIT ${rangeTo - rangeFrom + 1}`;
        }
        break;

      case 'INSERT':
        if (Array.isArray(data)) {
          // Multiple inserts
          const firstItem = data[0];
          const columns = Object.keys(firstItem);
          const columnsList = columns.join(', ');
          
          const valuesArray = data.map((item, itemIndex) => {
            const itemValues = columns.map((col) => {
              paramCount++;
              values.push(item[col]);
              return `$${paramCount}`;
            });
            return `(${itemValues.join(', ')})`;
          });
          
          query = `INSERT INTO ${table} (${columnsList}) VALUES ${valuesArray.join(', ')} RETURNING *`;
        } else {
          // Single insert
          const columns = Object.keys(data);
          const columnsList = columns.join(', ');
          const placeholders = columns.map(() => {
            paramCount++;
            return `$${paramCount}`;
          }).join(', ');
          values = Object.values(data);
          query = `INSERT INTO ${table} (${columnsList}) VALUES (${placeholders}) RETURNING *`;
        }
        break;

      case 'UPDATE':
        const updateColumns = Object.keys(data);
        const updateSetClause = updateColumns.map((col) => {
          paramCount++;
          values.push(data[col]);
          return `${col} = $${paramCount}`;
        }).join(', ');
        
        query = `UPDATE ${table} SET ${updateSetClause}`;
        
        // Add WHERE clause for UPDATE
        const updateWhereClause = buildWhereClause(where);
        if (updateWhereClause) {
          query += ` ${updateWhereClause}`;
        }
        query += ' RETURNING *';
        break;

      case 'DELETE':
        query = `DELETE FROM ${table}`;
        
        // Add WHERE clause for DELETE
        const deleteWhereClause = buildWhereClause(where);
        if (deleteWhereClause) {
          query += ` ${deleteWhereClause}`;
        }
        query += ' RETURNING *';
        break;

      default:
        return res.status(400).json({ error: "Invalid operation" });
    }

    console.log('Executing query:', query, 'with values:', values);
    const result = await db.query(query, values);
    
    if (count || head) {
      res.json({ 
        data: head ? null : result.rows, 
        error: null, 
        count: parseInt(result.rows[0]?.count || '0') 
      });
    } else {
      res.json({ data: result.rows, error: null });
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      data: null,
      error: error instanceof Error ? error.message : 'Database query failed'
    });
  }
};

/**
 * Execute stored procedures via API
 */
export const executeRPC: RequestHandler = async (req, res) => {
  try {
    const { functionName, params } = req.body;

    if (!functionName) {
      return res.status(400).json({ error: "Function name is required" });
    }

    const paramNames = Object.keys(params || {});
    const paramValues = Object.values(params || {});
    const paramPlaceholders = paramNames.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;
    console.log('Executing RPC:', query, 'with values:', paramValues);
    
    const result = await db.query(query, paramValues);
    
    res.json({ result: result.rows, error: null });
  } catch (error) {
    console.error('RPC error:', error);
    res.status(500).json({
      result: null,
      error: error instanceof Error ? error.message : 'RPC call failed'
    });
  }
};
