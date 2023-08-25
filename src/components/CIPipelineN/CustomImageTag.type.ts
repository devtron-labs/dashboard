import React from "react"
import { PipelineFormDataErrorType, PipelineFormType } from "../workflowEditor/types"

export const ImageTagType = {
    Default: 'DEFAULT',
    Custom: 'CUSTOM',
}

export interface CustomTagType {
    tagPattern: string
    counterX: number
}

export interface CustomImageTagsType{
    defaultTag: string[]
    formDataErrorObj: PipelineFormDataErrorType
    setFormDataErrorObj: React.Dispatch<React.SetStateAction<PipelineFormDataErrorType>>
    formData: PipelineFormType,
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
}