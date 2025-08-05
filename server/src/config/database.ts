import mongoose from 'mongoose';
import config from './environment';
import logger from '@/utils/logger';
import { createDatabaseIndexes } from './database-indexes';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected: boolean = false;
  private connectionRetries: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 5000;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private getConnectionConfig(): DatabaseConfig {
    const uri = config.NODE_ENV === 'test' ? config.MONGODB_URI_TEST : config.MONGODB_URI;
    
    const options: mongoose.ConnectOptions = {
      // Connection Pool Settings
      maxPoolSize: config.DB_MAX_POOL_SIZE || 10,
      minPoolSize: config.DB_MIN_POOL_SIZE || 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Added connect timeout

      // Buffering Settings
      bufferCommands: false,

      // Write Concern
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      },

      // Read Preference
      readPreference: 'primary',
      
      // Compression
      compressors: ['zlib'],
      
      // Authentication
      authSource: 'admin',
      
      // SSL/TLS (for production)
      ...(config.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
        sslCA: process.env.MONGODB_SSL_CA,
        sslCert: process.env.MONGODB_SSL_CERT,
        sslKey: process.env.MONGODB_SSL_KEY
      })
    };

    return { uri, options };
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const { uri, options } = this.getConnectionConfig();

    try {
      logger.info('Connecting to MongoDB...', {
        uri: uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
        environment: config.NODE_ENV,
        options: {
          maxPoolSize: options.maxPoolSize,
          serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
          connectTimeoutMS: options.connectTimeoutMS
        }
      });

      logger.debug('About to call mongoose.connect...');
      await mongoose.connect(uri, options);
      logger.debug('mongoose.connect completed successfully');
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      });

      this.setupEventListeners();
      this.setupIndexes();

    } catch (error) {
      logger.error('MongoDB connection failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        retries: this.connectionRetries,
        maxRetries: this.maxRetries
      });

      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        logger.info(`Retrying connection in ${this.retryDelay}ms... (${this.connectionRetries}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      } else {
        logger.error('Max connection retries reached. Exiting...');
        process.exit(1);
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private setupEventListeners(): void {
    // Disable Mongoose debug logging for index creation (only show errors)
    if (config.NODE_ENV === 'development') {
      mongoose.set('debug', false); // Disable all debug logs
    }

    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error', { error: error.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('close', () => {
      logger.info('Mongoose connection closed');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT. Closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM. Closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });
  }

  private async setupIndexes(): Promise<void> {
    try {
      logger.info('Setting up database indexes...');

      // Import models to ensure schema indexes are created
      await import('@/models');

      // Create comprehensive performance indexes
      if (config.NODE_ENV !== 'test') {
        logger.info('Starting database index creation...');
        await createDatabaseIndexes();
      }

      logger.info('✅ Database indexes setup completed successfully');
    } catch (error) {
      logger.error('❌ Error setting up database indexes', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host?: string;
    port?: number;
    database?: string;
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      // Ping the database
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  public async getStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const stats = await mongoose.connection.db?.stats();
      return {
        collections: stats?.collections || 0,
        objects: stats?.objects || 0,
        avgObjSize: stats?.avgObjSize || 0,
        dataSize: stats?.dataSize || 0,
        storageSize: stats?.storageSize || 0,
        indexes: stats?.indexes || 0,
        indexSize: stats?.indexSize || 0
      };
    } catch (error) {
      logger.error('Error getting database stats', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }
}

// Configure mongoose settings
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

// Enable debugging in development
if (config.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

export default DatabaseManager.getInstance();
