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
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { LazyImage } from '../../common'
import { ReactComponent as Minus } from '../../../assets/icons/ic-minus.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { SERVER_MODE } from '../../../config'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import {
    noop,
    ConditionalWrap,
    useMainContext,
    Icon,
    stopPropagation,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    Button,
} from '@devtron-labs/devtron-fe-common-lib'
import { ChartSelectProps } from './types'

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

    const classes = `dc__grid cursor dc__position-rel br-8 dc__border bg__primary dc__position-rel`

    const addChartTab = (e): void => {
        stopPropagation(e)
        addChart(chart.id)
    }

    const removeChartTab = (e): void => {
        stopPropagation(e)
        subtractChart(chart.id)
    }

    const selectChartTab = (e): void => {
        stopPropagation(e)
        selectChart(chart.id)
    }

    const onClickChartSelect = (): void => {
        onClick(chart.id)
    }

    const renderAddIcon = () => (
        <div
            className={` ${showCheckBoxOnHoverOnly ? 'chart-grid__check--hidden' : ''} dc__border br-6 cursor bg__primary`}
        >
            <ConditionalWrap
                condition
                wrap={(children) => (
                    <Tippy className="default-tt" arrow={false} placement="top" content="Add charts to deploy">
                        {children}
                    </Tippy>
                )}
            >
                <Button
                    icon={<Icon name="ic-add" size={null} color={null} />}
                    onClick={addChartTab}
                    dataTestId={`chart-add-${datatestid}`}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.small}
                    style={ButtonStyleType.default}
                    showAriaLabelInTippy={false}
                    ariaLabel="Add charts to deploy"
                />
            </ConditionalWrap>
        </div>
    )

    return (
        <div
            key={chart.id}
            className={`${showDescription ? 'flex-list' : ''} ${classes} ${
                showCheckBoxOnHoverOnly ? 'show-checkbox-onhover' : ''
            } ${selectedCount > 0 ? 'chart-grid-item--selected' : ''} `}
            onClick={onClick ? onClickChartSelect : noop}
            data-testid={`chart-card-${datatestid}`}
        >
            <div className={`flexbox-col flex-grow-1 px-20 pt-20 pb-16 dc__gap-12 ${showDescription ? '' : 'h-164'}`}>
                <div className="dc__border p-8 bg__primary br-8 dc__mxw-fit-content">
                    <div className={`${showDescription ? 'dc__chart-list-item__icon-wrapper' : 'icon-dim-32'}`}>
                        <LazyImage
                            className={`${showDescription ? 'dc__list-icon' : ''} dc__chart-grid-item__icon`}
                            src={chart.icon}
                            onError={handleImageError}
                        />
                    </div>
                </div>
                {serverMode == SERVER_MODE.FULL && addChart && subtractChart ? (
                    <div className={`chart-grid__check`}>
                        {selectedCount === 0 ? (
                            renderAddIcon()
                        ) : (
                            <div className="devtron-stepper devtron-stepper-grid">
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
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content="Add charts to deploy"
                                        >
                                            {children}
                                        </Tippy>
                                    )}
                                >
                                    <button
                                        className="devtron-stepper__item dc__transparent p-0 cursor"
                                        onClick={addChartTab}
                                        data-testid={`chart-add-${datatestid}`}
                                    >
                                        <Add className="icon-dim-14" />
                                    </button>
                                </ConditionalWrap>
                            </div>
                        )}
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
                <div className="flexbox flex-grow-1 dc__gap-4">
                    <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right">{chart.name}</div>

                    {showDescription && <div className="flex left fw-4 fs-13 lh-20 mt-8">{chart.description}</div>}
                </div>
            </div>
            <div className="flex left dc__content-space dc__border-top-n1 px-20 py-16">
                <div className="flex dc__gap-6">
                    <Icon name="ic-folder-user" size={16} color={null} />
                    <span className="cn-4">{chart.chart_name ? chart.chart_name : chart.docker_artifact_store_id}</span>
                </div>
                <div className="fs-12 cn-7 dc__ellipsis-right__2nd-line lh-18">v{chart.version}</div>
                {chart.deprecated && <DeprecatedWarn />}
            </div>
        </div>
    )
}

export default React.memo(ChartSelect)
