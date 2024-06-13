import { GetCertificateAndKeyDependencyErrorReturnType, TLSConfigDTO, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { enableTLSVerification, tlsConfig } = tlsConnection
    const { caData, tlsCertData, tlsKeyData } = tlsConfig

    const areAllFieldsEmpty = !caData && !tlsCertData && !tlsKeyData

    if (!enableTLSVerification || areAllFieldsEmpty) {
        return { enableTLSVerification: false, tlsConfig: null }
    }

    return tlsConnection
}

export const getCertificateAndKeyDependencyError = (
    tlsCertData: TLSConfigDTO['tlsCertData'],
    tlsKeyData: TLSConfigDTO['tlsKeyData'],
): GetCertificateAndKeyDependencyErrorReturnType => {
    if (tlsKeyData && !tlsCertData) {
        return {
            isTLSKeyDataEmpty: false,
            isTLSCertDataEmpty: true,
            message: 'TLS Certificate is required along with TLS Key',
        }
    }

    if (tlsCertData && !tlsKeyData) {
        return {
            isTLSKeyDataEmpty: true,
            isTLSCertDataEmpty: false,
            message: 'TLS Key is required along with TLS Certificate',
        }
    }

    return {
        isTLSKeyDataEmpty: false,
        isTLSCertDataEmpty: false,
        message: '',
    }
}
