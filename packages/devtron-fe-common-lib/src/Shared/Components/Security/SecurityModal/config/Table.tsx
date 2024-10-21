/*
 * Copyright (c) 2024. Devtron Inc.
 */

import {
    ApiResponseResultType,
    CATEGORIES,
    OpenDetailViewButtonProps,
    SecurityModalStateType,
    TablePropsType,
} from '../types'
import { getImageScanTableData } from './ImageScan'
import { getCodeScanTableData } from './CodeScan'
import { getKubernetesManifestTableData } from './KubernetesManifest'

export const getTableData = (
    data: ApiResponseResultType,
    category: SecurityModalStateType['category'],
    subCategory: SecurityModalStateType['subCategory'],
    setDetailViewData: OpenDetailViewButtonProps['setDetailViewData'],
    hidePolicy: boolean,
): TablePropsType => {
    switch (category) {
        case CATEGORIES.IMAGE_SCAN:
            return getImageScanTableData(data[category], subCategory, setDetailViewData, hidePolicy)
        case CATEGORIES.CODE_SCAN:
            return getCodeScanTableData(data[category], subCategory, setDetailViewData, hidePolicy)
        case CATEGORIES.KUBERNETES_MANIFEST:
            return getKubernetesManifestTableData(data[category], subCategory, setDetailViewData)
        default:
            return null
    }
}
