import { OpenAPIGenerator } from 'konfig-zod-to-openapi'
import * as fs from 'fs'
import * as path from 'path'
import { stringify } from 'yaml'
import { registry } from '.'

const generator = new OpenAPIGenerator(registry.definitions, '3.0.0')

const distFolder = path.join(path.dirname(__dirname))
const outputPath = path.join(distFolder, 'openapi.yaml')

fs.writeFileSync(
  outputPath,
  stringify(
    generator.generateDocument({
      info: {
        version: '1.0.0',
        title: 'Konfig REST API',
        description: 'To help you generate SDKs with Konfig',
        contact: {
          url: 'https://konfigthis.com',
        },
      },
      servers: [{ url: 'https://api.konfigthis.com' }],
      tags: [{ name: 'Linting' }, { name: 'Specifications' }, { name: 'SDK' }],
    })
  )
)
