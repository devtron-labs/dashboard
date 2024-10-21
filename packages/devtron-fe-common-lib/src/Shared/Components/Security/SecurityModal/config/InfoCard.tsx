/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { InfoCardPropsType, ApiResponseResultType, CATEGORIES, SecurityModalStateType } from '../types'
import { getImageScanInfoCardData } from './ImageScan'
import { getCodeScanInfoCardData } from './CodeScan'
import { getKubernetesManifestInfoCardData } from './KubernetesManifest'

export const getInfoCardData = (
    data: ApiResponseResultType,
    category: SecurityModalStateType['category'],
    subCategory: SecurityModalStateType['subCategory'],
): InfoCardPropsType => {
    switch (category) {
        case CATEGORIES.IMAGE_SCAN:
            return getImageScanInfoCardData(data[category], subCategory)
        case CATEGORIES.CODE_SCAN:
            return getCodeScanInfoCardData(data[category], subCategory)
        case CATEGORIES.KUBERNETES_MANIFEST:
            return getKubernetesManifestInfoCardData(data[category], subCategory)
        default:
            return null
    }
}
