/*
 * Copyright (c) 2024. Devtron Inc.
 */

import './loadingShimmerList.scss'
import { LoadingShimmerListType } from './types'

export const LoadingShimmerList = ({ shimmerRowClassName, hideLastColumn = false }: LoadingShimmerListType) => {
    const renderShimmer = () => <div className="shimmer-loading h-16 pt-8 pb-8" />

    const renderLoadingRow = () => {
        const rows = []
        for (let i = 0; i < 3; i++) {
            rows.push(
                <div key={i} className={`shimmer-loading-list__row dc__gap-16 px-20 ${shimmerRowClassName}`}>
                    {renderShimmer()}
                    {renderShimmer()}
                    {renderShimmer()}
                    {renderShimmer()}
                    {!hideLastColumn && renderShimmer()}
                </div>,
            )
        }
        return rows
    }

    // Wrapping with fragment to avoid error: 'LoadingShimmerList' cannot be used as a JSX component.

    return <> {renderLoadingRow()} </>
}
