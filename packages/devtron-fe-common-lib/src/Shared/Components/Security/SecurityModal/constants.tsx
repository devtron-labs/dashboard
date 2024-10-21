/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { SCAN_TOOL_ID_CLAIR, SCAN_TOOL_ID_TRIVY } from '@Shared/constants'
import PageNotFound from '@Images/ic-page-not-found.svg'
import { ReactComponent as MechanicalOperation } from '@Icons/ic-mechanical-operation.svg'
import { CATEGORIES, SUB_CATEGORIES, SeveritiesDTO, SortOrderEnum, EmptyStateType, StatusType } from './types'

export const DEFAULT_SECURITY_MODAL_STATE = {
    category: CATEGORIES.IMAGE_SCAN,
    subCategory: SUB_CATEGORIES.VULNERABILITIES,
    detailViewData: null,
}

export const CATEGORY_LABELS = {
    IMAGE_SCAN: 'Image Scan',
    CODE_SCAN: 'Code Scan',
    KUBERNETES_MANIFEST: 'Kubernetes Manifest',
} as const

export const SUB_CATEGORY_LABELS = {
    VULNERABILITIES: 'Vulnerability',
    LICENSE: 'License Risks',
    MISCONFIGURATIONS: 'Misconfigurations',
    EXPOSED_SECRETS: 'Exposed Secrets',
} as const

export const SEVERITIES = {
    [SeveritiesDTO.CRITICAL]: {
        label: 'Critical',
        color: '#B21212',
    },
    [SeveritiesDTO.HIGH]: {
        label: 'High',
        color: '#F33E3E',
    },
    [SeveritiesDTO.MEDIUM]: {
        label: 'Medium',
        color: '#FF7E5B',
    },
    [SeveritiesDTO.LOW]: {
        label: 'Low',
        color: '#FFB549',
    },
    [SeveritiesDTO.UNKNOWN]: {
        label: 'Unknown',
        color: '#B1B7BC',
    },
    [SeveritiesDTO.FAILURES]: {
        label: 'Failures',
        color: '#F33E3E',
    },
    [SeveritiesDTO.SUCCESSES]: {
        label: 'Successes',
        color: '#1DAD70',
    },
    [SeveritiesDTO.EXCEPTIONS]: {
        label: 'Exceptions',
        color: '#B1B7BC',
    },
} as const

export const ORDERED_SEVERITY_KEYS = [
    SeveritiesDTO.CRITICAL,
    SeveritiesDTO.HIGH,
    SeveritiesDTO.MEDIUM,
    SeveritiesDTO.LOW,
    SeveritiesDTO.UNKNOWN,
    SeveritiesDTO.FAILURES,
    SeveritiesDTO.EXCEPTIONS,
    SeveritiesDTO.SUCCESSES,
] as const

export const SEVERITY_DEFAULT_SORT_ORDER = SortOrderEnum.DESC

export const SCAN_FAILED_EMPTY_STATE: EmptyStateType = {
    image: PageNotFound,
    title: 'Scan failed',
    subTitle: 'Error: Security scan failed',
}

export const SCAN_IN_PROGRESS_EMPTY_STATE: EmptyStateType = {
    SvgImage: MechanicalOperation,
    title: 'Scan in progress',
    subTitle: 'Scan result will be available once complete. Please check again later',
}

export const MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID: Record<StatusType['scanToolName'], number> = {
    TRIVY: SCAN_TOOL_ID_TRIVY,
    CLAIR: SCAN_TOOL_ID_CLAIR,
}
