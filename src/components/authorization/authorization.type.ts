import React from 'react'

export interface FormType {
    name: string
    description: string
    expireAtInMs: string
}

export interface GenerateTokenType {
    showGenerateModal: boolean
    setShowGenerateModal: React.Dispatch<React.SetStateAction<boolean>>
    handleRegenerateActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
}

export interface GenerateActionButtonType {
    loader: boolean
    onCancel: () => void
    onSave
    buttonText: string
}
