import React from 'react'

export interface FormType {
    name: string
    description: string
    expireAtInMs: string
}

export interface GenerateTokenType {
    setShowGenerateToken: React.Dispatch<React.SetStateAction<boolean>>
}
