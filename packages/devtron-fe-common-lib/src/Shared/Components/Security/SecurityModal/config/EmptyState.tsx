/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { getCodeScanEmptyState } from './CodeScan'
import { getImageScanEmptyState } from './ImageScan'
import { getKubernetesManifestEmptyState } from './KubernetesManifest'
import { ApiResponseResultType, CATEGORIES, DetailViewDataType, SecurityModalStateType } from '../types'

export const getEmptyStateValues = (
    data: ApiResponseResultType,
    category: SecurityModalStateType['category'],
    subCategory: SecurityModalStateType['subCategory'],
    detailViewData: DetailViewDataType,
) => {
    switch (category) {
        case CATEGORIES.CODE_SCAN:
            return getCodeScanEmptyState(data, subCategory, detailViewData)
        case CATEGORIES.IMAGE_SCAN:
            return getImageScanEmptyState(data, subCategory, detailViewData)
        case CATEGORIES.KUBERNETES_MANIFEST:
            return getKubernetesManifestEmptyState(data, subCategory, detailViewData)
        default:
            return null
    }
}
