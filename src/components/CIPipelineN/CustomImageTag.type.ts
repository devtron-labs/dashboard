import React from 'react'
import { CIPipelineDataType } from '../ciPipeline/types'
import { PipelineFormDataErrorType, PipelineFormType } from '../workflowEditor/types'

export interface CustomTagType {
    tagPattern: string
    counterX: string
}

export interface CustomImageTagsType {
    savedTagPattern?: string
    formData: PipelineFormType
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
    formDataErrorObj: PipelineFormDataErrorType
    setFormDataErrorObj: React.Dispatch<React.SetStateAction<PipelineFormDataErrorType>>
    isCDBuild?: boolean
}
