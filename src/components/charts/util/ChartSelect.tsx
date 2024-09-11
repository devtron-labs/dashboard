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
import Tippy from '@tippyjs/react'
import { Chart } from '../charts.types'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { LazyImage } from '../../common'
import { ReactComponent as Minus } from '../../../assets/icons/ic-minus.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { SERVER_MODE } from '../../../config'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import { noop, ConditionalWrap, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

interface AllChartSelectProps {
    chart: Chart
    selectedCount?: number
    showCheckBoxOnHoverOnly: boolean
    onClick?: (chartId: number) => void
    addChart?: (chartId: number) => void
    subtractChart?: (chartId: number) => void
    selectChart?: (chartId: number) => void
    showDescription?: boolean
    datatestid?: string
}

interface Stepper extends AllChartSelectProps {
    addChart: (chartId: number) => void
    subtractChart: (chartId: number) => void
    selectChart?: never
}

interface Checkbox extends AllChartSelectProps {
    addChart?: never
    subtractChart?: never
    selectChart: (chartId: number) => void
}

export type ChartSelectProps = Stepper | Checkbox

const ChartSelect: React.FC<ChartSelectProps> = ({
    chart,
    selectChart,
    addChart,
    subtractChart,
    selectedCount = 0,
    showCheckBoxOnHoverOnly,
    onClick,
    showDescription,
    datatestid,
}) => {
    const { serverMode } = useMainContext()

    function handleImageError(e): void {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    const classes = `chart-grid-item ${showDescription ? '' : 'chart-grid-item--discover'} white-card dc__position-rel`

    const addchartTab = (e): void => {
        e.stopPropagation()
        addChart(chart.id)
    }

    const removeChartTab = (e): void => {
        e.stopPropagation()
        subtractChart(chart.id)
    }

    const selectChartTab = (e): void => {
        e.stopPropagation()
        selectChart(chart.id)
    }

    const onClickChartSelect = (): void => {
        onClick(chart.id)
    }

    return (
        <div
            key={chart.id}
            className={`${showDescription ? 'flex-list' : ''} ${classes} ${
                showCheckBoxOnHoverOnly ? 'show-checkbox-onhover' : ''
            } ${selectedCount > 0 ? 'chart-grid-item--selected' : ''}`}
            onClick={onClick ? onClickChartSelect : noop}
            data-testid={`chart-card-${datatestid}`}
        >
            <div
                className={`${showDescription ? 'dc__chart-list-item__icon-wrapper' : 'dc__chart-grid-item__icon-wrapper'}`}
            >
                <LazyImage
                    className={`${showDescription ? 'dc__list-icon' : ''} dc__chart-grid-item__icon`}
                    src={chart.icon}
                    onError={handleImageError}
                />
            </div>
            {serverMode == SERVER_MODE.FULL && addChart && subtractChart ? (
                <div
                    className={`chart-grid__check ${
                        showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''
                    } devtron-stepper`}
                >
                    <ConditionalWrap
                        condition={selectedCount > 0}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content="Remove charts from selection"
                            >
                                {children}
                            </Tippy>
                        )}
                    >
                        <button
                            className="devtron-stepper__item dc__transparent p-0 cursor"
                            disabled={selectedCount <= 0}
                            onClick={removeChartTab}
                            data-testid={`chart-remove-${datatestid}`}
                        >
                            <Minus className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                    <div className="devtron-stepper__item">
                        <span>{selectedCount}</span>
                    </div>
                    <ConditionalWrap
                        condition
                        wrap={(children) => (
                            <Tippy className="default-tt" arrow={false} placement="top" content="Add charts to deploy">
                                {children}
                            </Tippy>
                        )}
                    >
                        <button
                            className="devtron-stepper__item dc__transparent p-0 cursor"
                            onClick={addchartTab}
                            data-testid={`chart-add-${datatestid}`}
                        >
                            <Add className="icon-dim-14" />
                        </button>
                    </ConditionalWrap>
                </div>
            ) : (
                <input
                    onClick={selectChartTab}
                    type="checkbox"
                    checked={selectedCount > 0}
                    className={`chart-grid__check ${
                        showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''
                    } icon-dim-24`}
                />
            )}
            <div>
                <div className="chart-grid-item__title dc__ellipsis-right mb-4">
                    <span className="chart-grid-item__title-repo">
                        {chart.chart_name ? chart.chart_name : chart.docker_artifact_store_id}
                    </span>
                    <span>/{chart.name}</span>
                </div>
                <div className="flex left">
                    <div className="chart-grid-item__chart-version mr-12 dc__ellipsis-right__2nd-line">
                        {chart.version}
                    </div>
                    {chart.deprecated && <DeprecatedWarn />}
                </div>
                {showDescription && <div className="flex left fw-4 fs-13 lh-20 mt-8">{chart.description}</div>}
            </div>
        </div>
    )
}

export default React.memo(ChartSelect)
