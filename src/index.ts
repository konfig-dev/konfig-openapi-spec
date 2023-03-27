import { DiagnosticSeverity } from '@stoplight/types'
import { z } from './zod'
import { OpenAPIRegistry } from 'konfig-zod-to-openapi'
import { specExample } from './spec-example'
import { GenerateRequestBody as GRB } from 'konfig-lib'

export const registry = new OpenAPIRegistry()

// Security Schemes
registry.registerComponent('securitySchemes', 'authorization', {
  name: 'Authorization',
  in: 'header',
  type: 'apiKey',
})
registry.registerComponent('securitySchemes', 'session', {
  name: 'session',
  in: 'cookie',
  type: 'apiKey',
})

const specSchema = z.string().openapi({
  description: 'JSON or YAML string of your OpenAPI Specification',
  example: specExample,
})

const GENERATE_REQUEST_BODY_NAME = 'GenerateRequestBody'
export const GenerateRequestBody = registry.register(
  GENERATE_REQUEST_BODY_NAME,
  GRB
)

const GENERATE_RESPONSE_BODY_NAME = 'GenerateResponseBody'
export const GenerateResponseBodySchema = z.object({
  urls: z.object({ url: z.string(), key: z.string() }).array(),
  generateConfigId: z.string(),
})
registry.register(GENERATE_RESPONSE_BODY_NAME, GenerateResponseBodySchema)
export type GenerateResponseBody = z.infer<typeof GenerateResponseBodySchema>

const LINT_REQUEST_BODY_NAME = 'LintRequestBody'
export const LintRequestBody = registry.register(
  LINT_REQUEST_BODY_NAME,
  z.object({
    spec: specSchema,
  })
)

const PUSH_REQUEST_BODY_NAME = 'PushRequestBody'
export const PushRequestBody = registry.register(
  PUSH_REQUEST_BODY_NAME,
  z.object({
    spec: specSchema,
    gitHub: z.object({
      owner: z.string().openapi({
        description: 'The account owner of the repository',
        example: 'konfig-dev',
      }),
      repo: z.string().openapi({
        description: 'The name of the repository',
        example: 'acme-sdks',
      }),
    }),
  })
)

const JsonPath = z.union([z.number(), z.string()]).array()

const DiagnosticSeverityEnum = z.nativeEnum(DiagnosticSeverity).openapi({
  example: 0,
  description: `
/**
 * Something not allowed by the rules of a language or other means.
 */
Error = 0,
/**
 * Something suspicious but allowed.
 */
Warning = 1,
/**
 * Something to inform about but not a problem.
 */
Information = 2,
/**
 * Something to hint to a better way of doing it, like proposing
 * a refactoring.
 */
Hint = 3
`,
})

const SpectralDiagnostic = z
  .object({
    path: JsonPath.openapi({
      description: 'JsonPath',
      example: ['paths', '/pet', 'post'],
    }),
    code: z
      .string()
      .openapi({
        description: 'ID of linting rule',
        example: 'operation-operationId',
      })
      .or(z.number()),
    message: z.string().openapi({
      example:
        'Assign Operation#operationId to create better SDK method names.',
    }),
    severity: DiagnosticSeverityEnum,
  })
  .openapi({
    description:
      'Information regarding an error or warning found in your OpenAPI Spec.',
  })

export const LintResponseBody = registry.register(
  'LintResponseBody',
  z.object({
    diagnosis: SpectralDiagnostic.array(),
    passed: z.boolean().openapi({
      example: false,
      description:
        '`true` if no warnings or errors were found while linting else `false`',
    }),
  })
)

export const PushResponseBody = registry.register(
  'PushResponseBody',
  z.union([
    z.object({
      status: z.literal('created-pr'),
      link: z.string(),
    }),
    z.object({
      status: z.literal('no-diff'),
    }),
  ])
)

registry.registerPath({
  method: 'post',
  path: '/generate',
  description: 'Generate SDKs',
  summary:
    'Generate SDKs and receive signed S3 download URLs for the generated packages.',
  operationId: 'SDK_generate',
  tags: ['SDK'],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${GENERATE_REQUEST_BODY_NAME}`,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated SDKs',
      content: {
        'application/json': {
          schema: {
            $ref: `#/components/schemas/${GENERATE_RESPONSE_BODY_NAME}`,
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/push',
  description:
    'Push your OpenAPI Specification to Konfig to trigger SDK generation for a specified repository',
  summary: 'Push your OpenAPI Specification to Konfig',
  operationId: 'Specifications_push',
  tags: ['Specifications'],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${PUSH_REQUEST_BODY_NAME}`,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Status',
      content: {
        'application/json': {
          schema: PushResponseBody,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/lint',
  description:
    'Lint your OpenAPI Specification to ensure generation of high quality SDKs with Konfig',
  summary: 'Lint your OpenAPI Specification',
  operationId: 'Linting_lint',
  tags: ['Linting'],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${LINT_REQUEST_BODY_NAME}`,
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: 'Diagnosis information',
      content: {
        'application/json': {
          schema: LintResponseBody,
        },
      },
    },
  },
})

export type SpectralDiagnosisType = z.infer<typeof SpectralDiagnostic>
export type LintResponseBodyType = z.infer<typeof LintResponseBody>
export type PushResponseBodyType = z.infer<typeof PushResponseBody>
export type PushRequestBodyType = z.infer<typeof PushRequestBody>
