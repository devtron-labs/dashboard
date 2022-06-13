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
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}

export interface EditTokenType {
    setShowRegeneratedModal: React.Dispatch<React.SetStateAction<boolean>>
    showRegeneratedModal: boolean
    handleRegenerateActionButton: () => void
    setSelectedExpirationDate
    selectedExpirationDate
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}

export interface GenerateActionButtonType {
    loader: boolean
    onCancel: () => void
    onSave
    buttonText: string
    showDelete?: boolean
    onDelete: () => void
}
