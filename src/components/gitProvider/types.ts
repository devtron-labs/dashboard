import { InputFieldState } from '@devtron-labs/devtron-fe-common-lib'
import { TLSConfigDTO } from '../common/TLSConnectionForm/types'

interface TLSConfigInputType {
    caData: InputFieldState<TLSConfigDTO['caData']>
    tlsCertData: InputFieldState<TLSConfigDTO['tlsCertData']>
    tlsKeyData: InputFieldState<TLSConfigDTO['tlsKeyData']>
}

export interface TLSInputType {
    enableTLSVerification: boolean
    tlsConfig: TLSConfigInputType
}
