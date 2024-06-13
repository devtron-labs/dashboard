import { InputFieldState } from '@devtron-labs/devtron-fe-common-lib'
import { TLSConfigDTO } from '../common/TLSConnectionForm/types'

interface TLSConfigInputType {
    caData: InputFieldState<TLSConfigDTO['caData']>
    tlsCertData: InputFieldState<TLSConfigDTO['tlsCertData']>
    keyData: InputFieldState<TLSConfigDTO['keyData']>
}

export interface TLSInputType {
    enableTLSVerification: boolean
    tlsConfig: TLSConfigInputType
}
