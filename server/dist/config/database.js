"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const environment_1 = __importDefault(require("./environment"));
const logger_1 = __importDefault(require("@/utils/logger"));
const database_indexes_1 = require("./database-indexes");
class DatabaseManager {
    static instance;
    isConnected = false;
    connectionRetries = 0;
    maxRetries = 5;
    retryDelay = 5000;
    constructor() { }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    getConnectionConfig() {
        const uri = environment_1.default.NODE_ENV === 'test' ? environment_1.default.MONGODB_URI_TEST : environment_1.default.MONGODB_URI;
        const options = {
            maxPoolSize: environment_1.default.DB_MAX_POOL_SIZE || 10,
            minPoolSize: environment_1.default.DB_MIN_POOL_SIZE || 2,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            bufferCommands: false,
            writeConcern: {
                w: 'majority',
                j: true,
                wtimeout: 1000
            },
            readPreference: 'primary',
            compressors: ['zlib'],
            authSource: 'admin',
            ...(environment_1.default.NODE_ENV === 'production' && {
                ssl: true,
                sslValidate: true,
                sslCA: process.env.MONGODB_SSL_CA,
                sslCert: process.env.MONGODB_SSL_CERT,
                sslKey: process.env.MONGODB_SSL_KEY
            })
        };
        return { uri, options };
    }
    async connect() {
        if (this.isConnected) {
            logger_1.default.info('Database already connected');
            return;
        }
        const { uri, options } = this.getConnectionConfig();
        try {
            logger_1.default.info('Connecting to MongoDB...', {
                uri: uri.replace(/\/\/.*@/, '//***:***@'),
                environment: environment_1.default.NODE_ENV,
                options: {
                    maxPoolSize: options.maxPoolSize,
                    serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
                    connectTimeoutMS: options.connectTimeoutMS
                }
            });
            logger_1.default.debug('About to call mongoose.connect...');
            await mongoose_1.default.connect(uri, options);
            logger_1.default.debug('mongoose.connect completed successfully');
            this.isConnected = true;
            this.connectionRetries = 0;
            logger_1.default.info('MongoDB connected successfully', {
                host: mongoose_1.default.connection.host,
                port: mongoose_1.default.connection.port,
                database: mongoose_1.default.connection.name,
                readyState: mongoose_1.default.connection.readyState
            });
            this.setupEventListeners();
            this.setupIndexes();
        }
        catch (error) {
            logger_1.default.error('MongoDB connection failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                retries: this.connectionRetries,
                maxRetries: this.maxRetries
            });
            if (this.connectionRetries < this.maxRetries) {
                this.connectionRetries++;
                logger_1.default.info(`Retrying connection in ${this.retryDelay}ms... (${this.connectionRetries}/${this.maxRetries})`);
                setTimeout(() => {
                    this.connect();
                }, this.retryDelay);
            }
            else {
                logger_1.default.error('Max connection retries reached. Exiting...');
                process.exit(1);
            }
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.default.info('MongoDB disconnected successfully');
        }
        catch (error) {
            logger_1.default.error('Error disconnecting from MongoDB', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    setupEventListeners() {
        if (environment_1.default.NODE_ENV === 'development') {
            mongoose_1.default.set('debug', false);
        }
        mongoose_1.default.connection.on('connected', () => {
            logger_1.default.info('Mongoose connected to MongoDB');
        });
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.default.error('Mongoose connection error', { error: error.message });
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('Mongoose disconnected from MongoDB');
            this.isConnected = false;
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.default.info('Mongoose reconnected to MongoDB');
            this.isConnected = true;
        });
        mongoose_1.default.connection.on('close', () => {
            logger_1.default.info('Mongoose connection closed');
        });
        process.on('SIGINT', async () => {
            logger_1.default.info('Received SIGINT. Closing MongoDB connection...');
            await this.disconnect();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger_1.default.info('Received SIGTERM. Closing MongoDB connection...');
            await this.disconnect();
            process.exit(0);
        });
    }
    async setupIndexes() {
        try {
            logger_1.default.info('Setting up database indexes...');
            await Promise.resolve().then(() => __importStar(require('@/models')));
            if (environment_1.default.NODE_ENV !== 'test') {
                logger_1.default.info('Starting database index creation...');
                await (0, database_indexes_1.createDatabaseIndexes)();
            }
            logger_1.default.info('✅ Database indexes setup completed successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Error setting up database indexes', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose_1.default.connection.readyState,
            host: mongoose_1.default.connection.host,
            port: mongoose_1.default.connection.port,
            database: mongoose_1.default.connection.name
        };
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return false;
            }
            await mongoose_1.default.connection.db?.admin().ping();
            return true;
        }
        catch (error) {
            logger_1.default.error('Database health check failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
    async getStats() {
        try {
            if (!this.isConnected) {
                return null;
            }
            const stats = await mongoose_1.default.connection.db?.stats();
            return {
                collections: stats?.collections || 0,
                objects: stats?.objects || 0,
                avgObjSize: stats?.avgObjSize || 0,
                dataSize: stats?.dataSize || 0,
                storageSize: stats?.storageSize || 0,
                indexes: stats?.indexes || 0,
                indexSize: stats?.indexSize || 0
            };
        }
        catch (error) {
            logger_1.default.error('Error getting database stats', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return null;
        }
    }
}
mongoose_1.default.set('strictQuery', true);
mongoose_1.default.set('sanitizeFilter', true);
if (environment_1.default.NODE_ENV === 'development') {
    mongoose_1.default.set('debug', true);
}
exports.default = DatabaseManager.getInstance();
//# sourceMappingURL=database.js.map