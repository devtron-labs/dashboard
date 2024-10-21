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

import { PluginCardSkeletonListProps } from './types'

const PluginCardSkeleton = () => (
    <div className="p-12 flexbox dc__gap-16 w-100">
        <div className="p-4 dc__no-shrink icon-dim-40 shimmer-loading" />

        <div className="flexbox-col dc__gap-12 w-100">
            <div className="flexbox-col dc__gap-8 w-100">
                <div className="h-20 w-150 shimmer-loading" />

                <div className="flexbox-col dc__gap-4">
                    <div className="h-12 w-100 shimmer-loading" />
                    <div className="h-12 w-120 shimmer-loading" />
                </div>
            </div>

            <div className="h-20 w-60 shimmer-loading" />
        </div>
    </div>
)

const PluginCardSkeletonList = ({ count = 2 }: PluginCardSkeletonListProps) => (
    <>
        {Array(count)
            .fill(0)
            .map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <PluginCardSkeleton key={index} />
            ))}
    </>
)

export default PluginCardSkeletonList
