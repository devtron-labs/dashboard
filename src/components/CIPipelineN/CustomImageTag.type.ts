import React from "react"

export const ImageTagType = {
    Default: 'DEFAULT',
    Custom: 'CUSTOM',
}

export interface CustomTagType {
    tagPattern: string
    counterX: string
}

export interface CustomImageTagsType{
    imageTagValue: string
    setImageTagValue: React.Dispatch<React.SetStateAction<string>>
}