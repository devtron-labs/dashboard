import { GetCertificateAndKeyDependencyErrorReturnType, TLSConfigDTO, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { insecureSkipTLSVerify, tlsConfig } = tlsConnection
    const { caData, certData, keyData } = tlsConfig

    const areAllFieldsEmpty = !caData && !certData && !keyData

    if (insecureSkipTLSVerify || areAllFieldsEmpty) {
        return { insecureSkipTLSVerify: true, tlsConfig: null }
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
