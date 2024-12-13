/*
 * Copyright (c) 2024. Devtron Inc.
 */

import './loadingShimmerList.scss'
import { LoadingShimmerListType } from './types'

const renderShimmer = () => <div className="shimmer-loading h-16 pt-8 pb-8" />

export const LoadingShimmerList = ({ hideLastColumn = false }: LoadingShimmerListType) => {
    const count = 3

    return (
        <>
            {Array.from(Array(count).keys()).map((key) => (
                <div key={key} className="shimmer-loading-list__row dc__gap-16 px-20 py-12 env-list-row">
                    {renderShimmer()}
                    {renderShimmer()}
                    {renderShimmer()}
                    {renderShimmer()}
                    {!hideLastColumn && renderShimmer()}
                </div>
            ))}
        </>
    )
}
