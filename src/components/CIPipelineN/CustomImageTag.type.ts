import React from 'react'
import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
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
    selectedCDStageTypeValue?: OptionType
    setSelectedCDStageTypeValue?: React.Dispatch<React.SetStateAction<OptionType>>
}
