import { useCallback, useMemo, useRef } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    FiltersTypeEnum,
    Icon,
    PaginationEnum,
    stopPropagation,
    Table,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanRecommendationBar } from './SecrityScanRecommendationBar'
import { getRecommendationRowId, SECURITY_SCAN_RECOMMENDATIONS_TABLE_COLUMNS } from './SecurityRecommendation.utils'
import {
    ExpandRowCallback,
    SecurityScanRecommendationModalProps,
    SecurityScanRecommendationRowTypes,
    SecurityScanRecommendationTableAdditionalProps,
} from './types'

import './security.scss'

const CLOSE_BUTTON_ID = 'security-scan-recommendations-close'

export const SecurityScanModal = ({
    summary,
    hasRecommendations,
    recommendations,
    handleSecurityScanModal,
    lastScanTime,
}: SecurityScanRecommendationModalProps) => {
    const expandRowCallbacksRef = useRef<Record<string, ExpandRowCallback>>({})

    const registerExpandRowCallback = useCallback<
        SecurityScanRecommendationTableAdditionalProps['registerExpandRowCallback']
    >((rowId, expandRowCallback) => {
        if (!expandRowCallback) {
            delete expandRowCallbacksRef.current[rowId]

            return
        }

        expandRowCallbacksRef.current[rowId] = expandRowCallback
    }, [])

    const onRowClick = useCallback(
        (row: { id: string; data: SecurityScanRecommendationRowTypes }, isExpandedRow: boolean) => {
            const rowId = isExpandedRow ? row.data.parentRowId : row.id

            expandRowCallbacksRef.current[rowId]?.({
                stopPropagation: () => {},
            } as Parameters<ExpandRowCallback>[0])
        },
        [],
    )

    const rows = useMemo(
        () =>
            recommendations.map((recommendation, index) => {
                const rowId = getRecommendationRowId(recommendation, index)
                const rowData: SecurityScanRecommendationRowTypes = {
                    id: rowId,
                    parentRowId: rowId,
                    code: recommendation.code,
                    title: recommendation.title,
                    level: recommendation.level,
                    message: recommendation.message,
                    file: recommendation.file,
                    line: recommendation.line,
                    documentationUrl: recommendation.documentationUrl,
                    codeSnippet: recommendation.codeSnippet,
                }

                const expandedRowId = `expanded-row-${rowId}` as const

                return {
                    id: rowId,
                    data: rowData,
                    expandableRows: [
                        {
                            id: expandedRowId,
                            data: {
                                ...rowData,
                                id: expandedRowId,
                            },
                        },
                    ],
                }
            }),
        [recommendations],
    )

    const additionalProps = useMemo<SecurityScanRecommendationTableAdditionalProps>(
        () => ({
            registerExpandRowCallback,
        }),
        [registerExpandRowCallback],
    )

    return (
        <VisibleModal
            className="flex column right flex-grow-1 dc__overflow-hidden"
            close={handleSecurityScanModal}
            onEscape={handleSecurityScanModal}
            initialFocus={`#${CLOSE_BUTTON_ID}`}
        >
            <div
                className="security-scan-modal br-8 bg__primary mt-0-imp p-0 dc__no-top-radius flexbox-col flex-grow-1 mh-0 w-800 mr-0-imp"
                onClick={stopPropagation}
            >
                <div className="flex dc__content-space dc__align-items-center px-20 pt-16 pb-12 dc__border-bottom">
                    <h2 className="m-0 fs-16 fw-6 cn-9">Dockerfile Linting</h2>
                    <Button
                        id={CLOSE_BUTTON_ID}
                        dataTestId="close-security-scan-recommendations-modal"
                        ariaLabel="Close security scan recommendations modal"
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        onClick={handleSecurityScanModal}
                        icon={<Icon name="ic-close-large" color={null} />}
                    />
                </div>
                <div className="dc__overflow-auto flexbox-col flex-grow-1 mh-0">
                    <SecurityScanRecommendationBar
                        summary={summary}
                        hasRecommendations={hasRecommendations}
                        isModalView
                        lastScanTime={lastScanTime}
                    />
                    <Table<
                        SecurityScanRecommendationRowTypes,
                        FiltersTypeEnum.URL,
                        SecurityScanRecommendationTableAdditionalProps
                    >
                        id="table__security-scan-recommendations"
                        columns={SECURITY_SCAN_RECOMMENDATIONS_TABLE_COLUMNS}
                        rows={rows}
                        filtersVariant={FiltersTypeEnum.URL}
                        paginationVariant={PaginationEnum.NOT_PAGINATED}
                        filter={null}
                        additionalProps={additionalProps}
                        emptyStateConfig={{
                            noRowsConfig: {
                                title: 'No recommendations found',
                            },
                        }}
                        onRowClick={onRowClick}
                    />
                </div>
            </div>
        </VisibleModal>
    )
}
