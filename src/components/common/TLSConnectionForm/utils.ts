/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GetCertificateAndKeyDependencyErrorReturnType, TLSConfigDTO, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { enableTLSVerification, tlsConfig } = tlsConnection
    const { caData, tlsCertData, tlsKeyData } = tlsConfig

    // TODO: Have to check case for existing data since secrets are not sent in the response
    const areAllFieldsEmpty = !caData && !tlsCertData && !tlsKeyData

    if (!enableTLSVerification || areAllFieldsEmpty) {
        return { enableTLSVerification: false, tlsConfig: null }
    }

    return tlsConnection
}

// TODO: Have to check case for existing data since secrets are not sent in the response
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
