import { useEffect } from 'react'

import {
    FiltersTypeEnum,
    ScannedByToolModal,
    stopPropagation,
    TableCellComponentProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanRecommendationColumn } from '../../appDetails/appDetails.type'
import {
    RecommendationResult,
    RecommendationSnippetLine,
    SecurityScanRecommendationRowTypes,
    SecurityScanRecommendationTableAdditionalProps,
} from './types'

const RECOMMENDATION_LEVEL_PRIORITY: Record<string, number> = {
    error: 0,
    warning: 1,
}

const levelComparator = (a: unknown, b: unknown): number => {
    const aLevel = String(a || '').toLowerCase()
    const bLevel = String(b || '').toLowerCase()

    const aPriority = RECOMMENDATION_LEVEL_PRIORITY[aLevel] ?? Number.MAX_SAFE_INTEGER
    const bPriority = RECOMMENDATION_LEVEL_PRIORITY[bLevel] ?? Number.MAX_SAFE_INTEGER

    if (aPriority !== bPriority) {
        return aPriority - bPriority
    }

    return aLevel.localeCompare(bLevel)
}

const codeComparator = (a: unknown, b: unknown): number =>
    String(a || '')
        .toLowerCase()
        .localeCompare(String(b || '').toLowerCase())

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
                    <div className="security-scan-modal__snippet-lines">
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

export const SECURITY_SCAN_RECOMMENDATIONS_TABLE_COLUMNS: SecurityScanRecommendationColumn[] = [
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
        comparator: levelComparator,
        CellComponent: LevelCellComponent,
    },
    {
        label: 'Code',
        field: 'code',
        size: { fixed: 150 },
        isSortable: true,
        comparator: codeComparator,
        CellComponent: CodeCellComponent,
    },
]

export const HADOLINT_LINK = 'https://hadolint.github.io/hadolint/'

export const getSecurityScanRecommendationTitle = () => (
    <div className="flex dc__content-space dc__border-bottom-n1 pb-8">
        <h3 className="m-0 fs-13 fw-6 lh-20">Dockerfile Linting</h3>
        <ScannedByToolModal scanToolName="Hadolint" scanToolUrl={HADOLINT_LINK} />
    </div>
)
