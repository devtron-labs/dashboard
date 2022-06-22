import React from 'react'
import { CreateUser } from '../userGroups/userGroups.types'

export interface FormType {
    name: string
    description: string
    expireAtInMs: number
    dateType?: string
}
export interface TokenResponseType {
    success: boolean
    token: string
    userId: number
    userIdentifier: string
}

export interface GenerateTokenType {
    showGenerateModal: boolean
    setShowGenerateModal: React.Dispatch<React.SetStateAction<boolean>>
    handleGenerateTokenActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    tokenResponse: TokenResponseType
    setTokenResponse: React.Dispatch<React.SetStateAction<TokenResponseType>>
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
    reload: () => void
}

export interface TokenListType {
    expireAtInMs: number
    id: number
    name: string
    token: string
    updatedAt: string
    userId: number
    userIdentifier: string
    description: string
    lastUsedByIp: string
    lastUsedAt: string
}
export interface EditTokenType {
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    showRegeneratedModal: boolean
    handleRegenerateActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    tokenList: TokenListType[]
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
    copied: boolean
    reload: () => void
}

export interface GenerateActionButtonType {
    loader: boolean
    onCancel: () => void
    onSave
    buttonText: string
    showDelete?: boolean
    onDelete?: () => void
}

export interface GenerateTokenModalType {
    close: () => void
    token: string
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
    reload: () => void
    redirectToTokenList: () => void
    isRegenerationModal?: boolean
}

export interface APITokenListType {
    tokenList: TokenListType[]
    renderSearchToken: () => void
    reload: () => void
}

export interface EditDataType {
    name: string
    description: string
    expireAtInMs: any
    token: string
    id: number
    userId: number
    userIdentifier: string
}
export interface RegenerateModalType {
    close: () => void
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    editData: EditDataType
    customDate
    setCustomDate
    reload: () => void
    redirectToTokenList: () => void
}
