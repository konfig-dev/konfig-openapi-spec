import { ISpectralDiagnostic } from '@stoplight/spectral-core'
import { SpectralDiagnosisType } from '.'
const truth: ISpectralDiagnostic = 0 as unknown as ISpectralDiagnostic
let test: SpectralDiagnosisType = 0 as unknown as SpectralDiagnosisType
// The following will fail TypeScript compilation because it does not match
test = truth
