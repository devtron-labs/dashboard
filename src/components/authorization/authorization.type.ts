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
}
