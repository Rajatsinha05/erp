#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const moduleAlias = __importStar(require("module-alias"));
const path = __importStar(require("path"));
moduleAlias.addAliases({
    '@': path.join(__dirname),
    '@/config': path.join(__dirname, 'config'),
    '@/controllers': path.join(__dirname, 'controllers'),
    '@/middleware': path.join(__dirname, 'middleware'),
    '@/models': path.join(__dirname, 'models'),
    '@/routes': path.join(__dirname, 'routes'),
    '@/services': path.join(__dirname, 'services'),
    '@/utils': path.join(__dirname, 'utils'),
    '@/types': path.join(__dirname, 'types'),
    '@/validators': path.join(__dirname, 'validators')
});
console.log('✅ Module aliases registered');
const dotenvx_1 = require("@dotenvx/dotenvx");
(0, dotenvx_1.config)({ path: '.env.local' });
console.log('✅ Environment variables loaded');
console.log('📦 Testing imports...');
try {
    console.log('1. Testing config import...');
    const envConfig = require('./config/environment').default;
    console.log('✅ Config imported successfully');
    console.log('2. Testing logger import...');
    const logger = require('./utils/logger').logger;
    console.log('✅ Logger imported successfully');
    logger.info('🎉 Debug startup successful!');
    console.log('3. Testing database import...');
    const database = require('./config/database').default;
    console.log('✅ Database imported successfully');
    console.log('4. Testing database connection...');
    database.connect()
        .then(() => {
        logger.info('✅ Database connected successfully!');
        console.log('🎉 All tests passed! Server should work now.');
        process.exit(0);
    })
        .catch((error) => {
        logger.error('❌ Database connection failed:', error);
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    });
}
catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
}
//# sourceMappingURL=debug-start.js.map