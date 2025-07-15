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

import React from 'react'

import { GenericModalProps } from '@devtron-labs/devtron-fe-common-lib'

export interface FormType {
    name: string
    description: string
    expireAtInMs: number
    dateType?: string
}
export interface TokenResponseType {
    success: boolean
    userId: number
    userIdentifier: string
    hideApiToken: boolean
    token?: string
}

export interface GenerateTokenType {
    showGenerateModal: boolean
    setShowGenerateModal: React.Dispatch<React.SetStateAction<boolean>>
    handleGenerateTokenActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    tokenResponse: TokenResponseType
    setTokenResponse: React.Dispatch<React.SetStateAction<TokenResponseType>>
    reload: () => void
}

export interface TokenListType extends Pick<TokenResponseType, 'token' | 'userIdentifier' | 'userId' | 'hideApiToken'> {
    expireAtInMs: number
    id: number
    name: string
    description: string
    lastUsedByIp?: string
    lastUsedAt?: string
    updatedAt?: string
}

export interface EditDataType
    extends Pick<
        TokenListType,
        'name' | 'description' | 'expireAtInMs' | 'token' | 'id' | 'userId' | 'userIdentifier' | 'hideApiToken'
    > {}
export interface EditTokenType {
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    showRegeneratedModal: boolean
    handleRegenerateActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    tokenList: TokenListType[]
    reload: () => void
}

export interface GenerateActionButtonType {
    loader: boolean
    onCancel: () => void
    onSave: () => void
    buttonText: string
    regenerateButton?: boolean
    disabled: boolean
}

export interface GenerateTokenModalType {
    close: () => void
    token: TokenListType['token']
    reload: () => void
    redirectToTokenList: () => void
    isRegenerationModal?: boolean
    open: GenericModalProps['open']
    hideApiToken: TokenListType['hideApiToken']
}

export interface APITokenListType {
    tokenList: TokenListType[]
    renderSearchToken: () => void
    reload: () => void
}

export interface RegenerateModalType {
    close: () => void
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    editData: EditDataType
    customDate: number
    setCustomDate: React.Dispatch<React.SetStateAction<number>>
    reload: () => void
    redirectToTokenList: () => void
}

export interface DeleteAPITokenModalProps {
    tokenData: TokenListType
    reload: () => void
    setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
    isEditView?: boolean
}
