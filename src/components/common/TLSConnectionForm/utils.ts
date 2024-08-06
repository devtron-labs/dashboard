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

import { GetCertificateAndKeyDependencyErrorReturnType, GetIsTLSDataPresentParamsType, TLSConnectionDTO } from './types'

export const getTLSConnectionPayloadValues = (tlsConnection: TLSConnectionDTO): TLSConnectionDTO => {
    const { enableTLSVerification, isCADataPresent, isTLSCertDataPresent, isTLSKeyDataPresent } = tlsConnection

    const areAllFieldsEmpty = !isCADataPresent && !isTLSCertDataPresent && !isTLSKeyDataPresent

    if (!enableTLSVerification || areAllFieldsEmpty) {
        return {
            enableTLSVerification: false,
            tlsConfig: null,
            isCADataPresent: false,
            isTLSCertDataPresent: false,
            isTLSKeyDataPresent: false,
        }
    }

    return tlsConnection
}

export const getCertificateAndKeyDependencyError = (
    isTLSCertDataPresent: TLSConnectionDTO['isTLSCertDataPresent'],
    isTLSKeyDataPresent: TLSConnectionDTO['isTLSKeyDataPresent'],
): GetCertificateAndKeyDependencyErrorReturnType => {
    if (isTLSKeyDataPresent && !isTLSCertDataPresent) {
        return {
            isTLSKeyError: false,
            isTLSCertError: true,
            message: 'TLS Certificate is required along with TLS Key',
        }
    }

    if (isTLSCertDataPresent && !isTLSKeyDataPresent) {
        return {
            isTLSKeyError: true,
            isTLSCertError: false,
            message: 'TLS Key is required along with TLS Certificate',
        }
    }

    return {
        isTLSKeyError: false,
        isTLSCertError: false,
        message: '',
    }
}

export const getIsTLSDataPresent = ({
    targetValue,
    isTLSInitiallyConfigured,
    wasFieldInitiallyPresent,
    wasFieldClearedAfterInitialConfig,
}: GetIsTLSDataPresentParamsType): boolean => {
    if (!isTLSInitiallyConfigured || wasFieldClearedAfterInitialConfig) {
        return targetValue.length > 0
    }

    if (targetValue.length === 0) {
        return wasFieldInitiallyPresent
    }

    return true
}
