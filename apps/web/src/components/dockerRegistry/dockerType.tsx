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

import React, { ReactElement } from 'react'
import { OptionType } from '@devtron-labs/devtron-fe-common-lib'

export interface CustomCredential {
    server: string
    email: string
    username: string
    password: string
}

interface CredentialTypes {
    SAME_AS_REGISTRY: string
    NAME: string
    CUSTOM_CREDENTIAL: string
}

export enum SSHAuthenticationType {
    Password = 'PASSWORD',
    SSH_Private_Key = 'SSH_PRIVATE_KEY',
    Password_And_SSH_Private_Key = 'PASSWORD_AND_SSH_PRIVATE_KEY',
}

export enum RemoteConnectionType {
    Direct = 'DIRECT',
    Proxy = 'PROXY',
    SSHTunnel = 'SSH',
}

export const CredentialType: CredentialTypes = {
    SAME_AS_REGISTRY: 'SAME_AS_REGISTRY',
    NAME: 'NAME',
    CUSTOM_CREDENTIAL: 'CUSTOM_CREDENTIAL',
}
export interface ManageRegistryType {
    clusterOption: OptionType[]
    blackList: OptionType[]
    setBlackList: React.Dispatch<React.SetStateAction<OptionType[]>>
    whiteList: OptionType[]
    setWhiteList: React.Dispatch<React.SetStateAction<OptionType[]>>
    blackListEnabled: boolean
    setBlackListEnabled: React.Dispatch<React.SetStateAction<boolean>>
    credentialsType: string
    setCredentialType: React.Dispatch<React.SetStateAction<string>>
    credentialValue: string
    setCredentialValue: React.Dispatch<React.SetStateAction<string>>
    onClickHideManageModal: () => void
    appliedClusterList: OptionType[]
    ignoredClusterList: OptionType[]
    customCredential: CustomCredential
    setCustomCredential: React.Dispatch<React.SetStateAction<CustomCredential>>
    setErrorValidation: React.Dispatch<React.SetStateAction<boolean>>
    errorValidation: boolean
}

export const CustomStateKeys = {
    ID: 'id',
    AWS_ACCESS_KEY_ID: 'awsAccessKeyId',
    AWS_SECRET_ACCESS_KEY: 'awsSecretAccessKey',
    REGISTRY_URL: 'registryUrl',
    USER_NAME: 'username',
    PASSWORD: 'password',
    REPOSITORY_LIST: 'repositoryList',
}

export const RemoteConnectionTypeRegistry = 'registry'

export interface RegistryType {
    label: string
    defaultValue: string
    placeholder: string
}
export interface EAModeRegistryType {
    label: string
    value: string
    defaultRegistryURL: string
    desiredFormat: string
    gettingStartedLink: string
    id: RegistryType
    password: RegistryType
    placeholderText: string
    registryURL: RegistryType
    startIcon: ReactElement
}
