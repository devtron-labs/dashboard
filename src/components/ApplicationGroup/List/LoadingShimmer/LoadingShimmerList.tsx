/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoadingShimmerListType } from './types'

import './loadingShimmerList.scss'

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
