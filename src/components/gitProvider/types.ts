import { InputFieldState } from '@devtron-labs/devtron-fe-common-lib'
import { TLSConfigDTO, TLSConnectionDTO } from '../common/TLSConnectionForm/types'

interface TLSConfigInputType {
    caData: InputFieldState<TLSConfigDTO['caData']>
    tlsCertData: InputFieldState<TLSConfigDTO['tlsCertData']>
    tlsKeyData: InputFieldState<TLSConfigDTO['tlsKeyData']>
}

export interface TLSInputType
    extends Pick<
        TLSConnectionDTO,
        'enableTLSVerification' | 'isCADataPresent' | 'isTLSCertDataPresent' | 'isTLSKeyDataPresent'
    > {
    tlsConfig: TLSConfigInputType
    isCADataClearedAfterInitialConfig: boolean
    isTLSCertDataClearedAfterInitialConfig: boolean
    isTLSKeyDataClearedAfterInitialConfig: boolean
}
