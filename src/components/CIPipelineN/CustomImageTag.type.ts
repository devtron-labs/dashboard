import React from 'react'
import { PipelineFormDataErrorType, PipelineFormType } from '../workflowEditor/types'
import { OptionType } from '@devtron-labs/devtron-fe-common-lib'

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
