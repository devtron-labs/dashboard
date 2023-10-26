import React from 'react'
import { CIPipelineDataType } from '../ciPipeline/types'

export interface CustomTagType {
    tagPattern: string
    counterX: string
}

export interface CustomImageTagsType {
    selectedCIPipeline: CIPipelineDataType
}
