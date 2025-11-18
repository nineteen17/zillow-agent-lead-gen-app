import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zillow NZ API',
      version: '1.0.0',
      description: 'NZ property platform API with Zillow-style Premier Agent system',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: env.API_URL,
        description: `${env.NODE_ENV} server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'zillow-nz.session_token',
        },
      },
      schemas: {
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            addressLine1: { type: 'string' },
            suburb: { type: 'string' },
            city: { type: 'string' },
            cvValue: { type: 'integer' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            propertyType: {
              type: 'string',
              enum: ['house', 'apartment', 'townhouse', 'unit', 'land', 'rural', 'other'],
            },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            leadType: {
              type: 'string',
              enum: ['buyer', 'seller', 'mortgage', 'rental'],
            },
            suburb: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            message: { type: 'string' },
            status: {
              type: 'string',
              enum: ['new', 'delivered', 'contacted', 'qualified', 'closed_won', 'closed_lost'],
            },
          },
        },
        Valuation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            propertyId: { type: 'string' },
            estimateValue: { type: 'integer' },
            confidenceBandLow: { type: 'integer' },
            confidenceBandHigh: { type: 'integer' },
            modelVersion: { type: 'string' },
            estimateDate: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Properties', description: 'Property management endpoints' },
      { name: 'Valuations', description: 'Property valuation endpoints' },
      { name: 'Suburbs', description: 'Suburb statistics endpoints' },
      { name: 'Leads', description: 'Lead capture endpoints' },
      { name: 'Agent', description: 'Agent dashboard endpoints (requires authentication)' },
      { name: 'Admin', description: 'Admin endpoints (requires admin role)' },
    ],
  },
  apis: ['./src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
