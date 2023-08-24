import React from "react"
import { PipelineFormDataErrorType } from "../workflowEditor/types"

export const ImageTagType = {
    Default: 'DEFAULT',
    Custom: 'CUSTOM',
}

export interface CustomTagType {
    tagPattern: string
    counterX: number
}

export interface CustomImageTagsType{
    setCustomTagObject: React.Dispatch<React.SetStateAction<CustomTagType>>
    customTagObject: CustomTagType
    defaultTag: string[]
    formDataErrorObj: PipelineFormDataErrorType
    setFormDataErrorObj: React.Dispatch<React.SetStateAction<PipelineFormDataErrorType>>
}