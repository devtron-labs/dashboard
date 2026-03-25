import { useEffect } from 'react'

import { FiltersTypeEnum, stopPropagation, TableCellComponentProps } from '@devtron-labs/devtron-fe-common-lib'

import {
    RecommendationResult,
    RecommendationSnippetLine,
    SecurityScanRecommendationRowTypes,
    SecurityScanRecommendationTableAdditionalProps,
} from './types'

export const getRecommendationRowId = (recommendation: RecommendationResult, index: number) =>
    `recommendation-${recommendation.code || 'code'}-${index}`

export const getSnippetLines = ({
    codeSnippet,
}: Pick<SecurityScanRecommendationRowTypes, 'codeSnippet'>): RecommendationSnippetLine[] =>
    [...(codeSnippet?.before || []), codeSnippet?.current, ...(codeSnippet?.after || [])].filter(Boolean)

export const RecommendationCellComponent = ({
    row,
    isExpandedRow,
    expandRowCallback,
    registerExpandRowCallback,
}: TableCellComponentProps<
    SecurityScanRecommendationRowTypes,
    FiltersTypeEnum.URL,
    SecurityScanRecommendationTableAdditionalProps
>) => {
    useEffect(() => {
        if (isExpandedRow) {
            return undefined
        }

        registerExpandRowCallback(row.id, expandRowCallback)

        return () => {
            registerExpandRowCallback(row.id)
        }
    }, [expandRowCallback, isExpandedRow, registerExpandRowCallback, row.id])

    if (!isExpandedRow) {
        return <div className="fs-13 fw-12 cn-9 fw-6 py-16">{row.data.title}</div>
    }

    const snippetLines = getSnippetLines(row.data)

    return (
        <div className="security-scan-modal__expanded-row br-4 mono">
            <div className=" bg__secondary cn-9 fs-13 dc__top-radius-4 px-12 py-8 dc__border-bottom">Dockerfile</div>
            {snippetLines.length ? (
                <div className="security-scan-modal__snippet">
                    {snippetLines.map((snippetLine) => (
                        <div
                            key={`${row.id}-${snippetLine.line || 'line'}-${snippetLine.content}`}
                            className="security-scan-modal__snippet-line fs-13 p-6"
                        >
                            <span
                                className={`lh-20 flex ${
                                    snippetLine.isIssue ? 'security-scan-modal__snippet-line--issue' : 'cn-9'
                                }`}
                            >
                                {snippetLine.line || ''}
                            </span>
                            <span className="security-scan-modal__snippet-content">{snippetLine.content}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="security-scan-modal__snippet-empty">No code snippet available.</div>
            )}
        </div>
    )
}

export const CodeCellComponent = ({
    row,
    isExpandedRow,
}: TableCellComponentProps<
    SecurityScanRecommendationRowTypes,
    FiltersTypeEnum.URL,
    SecurityScanRecommendationTableAdditionalProps
>) => {
    if (isExpandedRow) {
        return null
    }

    return (
        <a
            href={row.data.documentationUrl}
            target="_blank"
            rel="noreferrer"
            onClick={stopPropagation}
            className="py-16 dc__link dc__block"
        >
            {row.data.code}
        </a>
    )
}

export const LevelCellComponent = ({
    row,
    isExpandedRow,
}: TableCellComponentProps<
    SecurityScanRecommendationRowTypes,
    FiltersTypeEnum.URL,
    SecurityScanRecommendationTableAdditionalProps
>) => {
    if (isExpandedRow) {
        return null
    }

    return (
        <div className="py-16">
            <span className={`${row.data.level.toLowerCase()} br-4 px-6 fs-12 lh-20 fw-6 dc__capitalize`}>
                {row.data.level}
            </span>
        </div>
    )
}

export const SECURITY_SCAN_RECOMMENDATIONS_TABLE_COLUMNS = [
    {
        label: 'Recommendations',
        field: 'title',
        size: null,
        CellComponent: RecommendationCellComponent,
    },
    {
        label: 'Level',
        field: 'level',
        size: { fixed: 100 },
        isSortable: true,
        CellComponent: LevelCellComponent,
    },
    {
        label: 'Code',
        field: 'code',
        size: { fixed: 150 },
        isSortable: true,
        CellComponent: CodeCellComponent,
    },
]
