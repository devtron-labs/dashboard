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

import { InputFieldState } from '@devtron-labs/devtron-fe-common-lib'

export interface TLSConfigDTO {
    caData: string
    tlsCertData: string
    tlsKeyData: string
}

export interface TLSConnectionDTO {
    enableTLSVerification: boolean
    tlsConfig: TLSConfigDTO
}

export enum TLSConnectionFormActionType {
    TOGGLE_INSECURE_SKIP_TLS_VERIFY = 'TOGGLE_INSECURE_SKIP_TLS_VERIFY',
    UPDATE_CA_DATA = 'UPDATE_CA_DATA',
    UPDATE_CERT_DATA = 'UPDATE_CERT_DATA',
    UPDATE_KEY_DATA = 'UPDATE_KEY_DATA',
}

interface TLSConnectionHandleChangeParamsType {
    action: TLSConnectionFormActionType
    payload?: string
}

export interface TLSConnectionFormProps extends Pick<TLSConnectionDTO, 'enableTLSVerification'> {
    caData: InputFieldState<TLSConfigDTO['caData']>
    tlsCertData: InputFieldState<TLSConfigDTO['tlsCertData']>
    tlsKeyData: InputFieldState<TLSConfigDTO['tlsKeyData']>
    isTLSInitiallyConfigured: boolean
    handleChange: ({ action, payload }: TLSConnectionHandleChangeParamsType) => void
    rootClassName?: string
}

export interface TLSInputFieldProps extends Pick<TLSConnectionFormProps, 'handleChange'> {
    label: string
    id: string
    placeholder: string
    isSensitive: boolean
    value: string
    error: string
    updateAction:
        | TLSConnectionFormActionType.UPDATE_CA_DATA
        | TLSConnectionFormActionType.UPDATE_CERT_DATA
        | TLSConnectionFormActionType.UPDATE_KEY_DATA
}

export interface GetCertificateAndKeyDependencyErrorReturnType {
    isTLSKeyDataEmpty: boolean
    isTLSCertDataEmpty: boolean
    message: string
}
