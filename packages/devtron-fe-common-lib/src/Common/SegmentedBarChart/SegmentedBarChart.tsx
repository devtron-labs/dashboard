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

import React from 'react'
import { SegmentedBarChartProps, Entity } from './types'
import { FALLBACK_ENTITY } from './constants'
import './styles.scss'

const SegmentedBarChart: React.FC<SegmentedBarChartProps> = ({
    entities = [FALLBACK_ENTITY],
    rootClassName,
    countClassName,
    labelClassName,
}) => {
    const total = entities.reduce((sum, entity) => entity.value + sum, 0)
    const filteredEntities = entities.filter((entity) => entity.value)

    const calcSegmentWidth = (entity: Entity) => `${(entity.value / total) * 100}%`

    return (
        <div className={`flexbox-col w-100 dc__gap-12 ${rootClassName}`}>
            <div className="flexbox dc__gap-16">
                {entities?.map((entity) => (
                    <div className="flexbox dc__gap-4 dc__align-items-center">
                        <div className="dot" style={{ backgroundColor: entity.color, width: '10px', height: '10px' }} />
                        <span className={countClassName} data-testid={`segmented-bar-chart-${entity.label}-value`}>
                            {entity.value}
                        </span>
                        <span className={labelClassName} data-testid={`segmented-bar-chart-${entity.label}-label`}>
                            {entity.label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flexbox dc__gap-2">
                {filteredEntities?.map((entity, index, map) => (
                    <div
                        key={entity.label}
                        className={`h-8 ${index === 0 ? 'dc__left-radius-4' : ''} ${
                            index === map.length - 1 ? 'dc__right-radius-4' : ''
                        }`}
                        style={{ backgroundColor: entity.color, width: calcSegmentWidth(entity) }}
                    />
                ))}
            </div>
        </div>
    )
}

export default SegmentedBarChart
