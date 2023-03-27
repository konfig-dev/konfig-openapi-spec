import { extendZodWithOpenApi } from 'konfig-zod-to-openapi'
import { z } from 'zod'
extendZodWithOpenApi(z)

export { z }
