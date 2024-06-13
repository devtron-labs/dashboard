import { GetCertificateAndKeyDependencyErrorReturnType, TLSConfigDTO, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { enableTLSVerification, tlsConfig } = tlsConnection
    const { caData, tlsCertData, keyData } = tlsConfig

    const areAllFieldsEmpty = !caData && !tlsCertData && !keyData

    if (!enableTLSVerification || areAllFieldsEmpty) {
        return { enableTLSVerification: false, tlsConfig: null }
    }

    return tlsConnection
}

export const getCertificateAndKeyDependencyError = (
    tlsCertData: TLSConfigDTO['tlsCertData'],
    keyData: TLSConfigDTO['keyData'],
): GetCertificateAndKeyDependencyErrorReturnType => {
    if (keyData && !tlsCertData) {
        return {
            isKeyDataEmpty: false,
            isTLSCertDataEmpty: true,
            message: 'TLS Certificate is required along with TLS Key',
        }
    }

    if (tlsCertData && !keyData) {
        return {
            isKeyDataEmpty: true,
            isTLSCertDataEmpty: false,
            message: 'TLS Key is required along with TLS Certificate',
        }
    }

    return {
        isKeyDataEmpty: false,
        isTLSCertDataEmpty: false,
        message: '',
    }
}
