import type { MouseEvent } from 'react'

import { ResponseType, ScanRecommendationsDTO, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'

export interface SecurityScansRecommendationsProps {
    scanRecommendationLoading: boolean
    scanRecommendationResponse: ResponseType<ScanRecommendationsDTO>
    scanRecommendationError: ServerErrors
    reloadScanRecommendation: () => void
}

export type RecommendationResult = ScanRecommendationsDTO['results'][number]

export type RecommendationSnippetLine = {
    line?: number
    content: string
    isIssue?: boolean
}

export type SecurityScanRecommendationModalProps = {
    summary: ScanRecommendationsDTO['severity_summary']
    recommendations: ScanRecommendationsDTO['results']
    handleSecurityScanModal?: () => void
    lastScanTime?: ScanRecommendationsDTO['createdOn'] | string
    isModalView?: boolean
}

export type SecurityScanRecommendationBarProps = Pick<
    SecurityScanRecommendationModalProps,
    'summary' | 'handleSecurityScanModal' | 'isModalView' | 'lastScanTime'
> & {}

export type SecurityScanRecommendationRowTypes = {
    id: string
    parentRowId: string
    code: string
    title: string
    level: string
    message: string
    file: string
    line: number
    documentationUrl: string
    codeSnippet: RecommendationResult['codeSnippet']
}

export type ExpandRowCallback = (event: MouseEvent<HTMLButtonElement>) => void

export type SecurityScanRecommendationTableAdditionalProps = {
    registerExpandRowCallback: (rowId: string, expandRowCallback?: ExpandRowCallback) => void
}
