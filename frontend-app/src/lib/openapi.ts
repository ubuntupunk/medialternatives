import swaggerJSDoc from 'swagger-jsdoc';

/**
 * OpenAPI 3.1.0 specification for Media Alternatives API
 */
const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'Media Alternatives API',
    version: '1.0.0',
    description: 'API for Media Alternatives frontend application',
    contact: {
      name: 'API Support',
      email: 'support@medialternatives.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production'
        ? 'https://medialternatives.com'
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  security: [
    {
      bearerAuth: []
    },
    {
      cookieAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth-session'
      }
    },
    schemas: {
      APIResponse: {
        type: 'object',
        required: ['success'],
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the request was successful'
          },
          data: {
            description: 'Response data (present when success is true)'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code'
              },
              message: {
                type: 'string',
                description: 'Human-readable error message'
              },
              details: {
                description: 'Additional error details'
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Response timestamp'
              },
              requestId: {
                type: 'string',
                description: 'Unique request identifier'
              },
              version: {
                type: 'string',
                description: 'API version'
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'Unique user identifier'
          },
          username: {
            type: 'string',
            description: 'Display name'
          },
          isAdmin: {
            type: 'boolean',
            description: 'Whether user has admin privileges'
          }
        }
      },
      SearchResult: {
        type: 'object',
        properties: {
          ID: {
            type: 'integer',
            description: 'WordPress post ID'
          },
          title: {
            type: 'string',
            description: 'Post title'
          },
          excerpt: {
            type: 'string',
            description: 'Post excerpt'
          },
          content: {
            type: 'string',
            description: 'Post content'
          },
          slug: {
            type: 'string',
            description: 'Post slug'
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Publication date'
          },
          modified: {
            type: 'string',
            format: 'date-time',
            description: 'Last modified date'
          },
          type: {
            type: 'string',
            description: 'Post type'
          },
          link: {
            type: 'string',
            format: 'uri',
            description: 'Post permalink'
          },
          author: {
            type: 'string',
            description: 'Author name'
          },
          featured_media: {
            type: 'string',
            format: 'uri',
            description: 'Featured image URL'
          },
          categories: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Post categories'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Post tags'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Search',
      description: 'Content search functionality'
    },
    {
      name: 'Analytics',
      description: 'Analytics and metrics endpoints'
    },
    {
      name: 'AdSense',
      description: 'Google AdSense integration'
    },
    {
      name: 'Content Generation',
      description: 'AI-powered content generation'
    }
  ]
};

/**
 * Swagger JSDoc options
 */
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.js'
  ]
};

/**
 * Generate OpenAPI specification
 */
export const specs = swaggerJSDoc(options);

/**
 * Get OpenAPI specification as JSON
 */
export function getOpenAPISpec() {
  return specs;
}