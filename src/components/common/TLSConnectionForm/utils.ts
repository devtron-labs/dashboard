import { GetCertificateAndKeyDependencyErrorReturnType, TLSConfigDTO, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { enableTLSVerification, tlsConfig } = tlsConnection
    const { caData, certData, keyData } = tlsConfig

    const areAllFieldsEmpty = !caData && !certData && !keyData

    if (!enableTLSVerification || areAllFieldsEmpty) {
        return { enableTLSVerification: false, tlsConfig: null }
    }

    return tlsConnection
}

export const getCertificateAndKeyDependencyError = (
    certData: TLSConfigDTO['certData'],
    keyData: TLSConfigDTO['keyData'],
): GetCertificateAndKeyDependencyErrorReturnType => {
    if (keyData && !certData) {
        return {
            isKeyDataEmpty: false,
            isCertDataEmpty: true,
            message: 'TLS Certificate is required along with TLS Key',
        }
    }

    if (certData && !keyData) {
        return {
            isKeyDataEmpty: true,
            isCertDataEmpty: false,
            message: 'TLS Key is required along with TLS Certificate',
        }
    }

    return {
        isKeyDataEmpty: false,
        isCertDataEmpty: false,
        message: '',
    }
}
