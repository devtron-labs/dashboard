import React from 'react'

export interface FormType {
    name: string
    description: string
    expireAtInMs: number
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
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    tokenResponse: TokenResponseType
    setTokenResponse: React.Dispatch<React.SetStateAction<TokenResponseType>>
    customDate: number
    setCustomDate: React.Dispatch<React.SetStateAction<number>>
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
    copied: boolean
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
}
export interface EditTokenType {
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    showRegeneratedModal: boolean
    handleRegenerateActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    tokenResponse: TokenResponseType
    customDate: number
    setCustomDate: React.Dispatch<React.SetStateAction<number>>
    tokenList: TokenListType[]
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
    copied: boolean
    setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
    deleteConfirmation: boolean
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
    copied: boolean
}
