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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    noop,
    stopPropagation,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import placeHolder from '../../assets/icons/ic-plc-chart.svg'
import { SERVER_MODE } from '../../config'
import { LazyImage } from '../common'
import { ChartSelectProps } from './util/types'
import { renderDeprecatedWarning } from './charts.util'

const ChartCard = ({
    chart,
    selectChart,
    addChart,
    subtractChart,
    selectedCount = 0,
    showCheckBoxOnHoverOnly,
    onClick,
    dataTestId,
    isListView,
}: ChartSelectProps) => {
    const { serverMode } = useMainContext()

    const handleImageError = (e): void => {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

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
        <Button
            icon={<Icon name="ic-add" size={null} color={null} />}
            onClick={addChartTab}
            dataTestId={`chart-add-${dataTestId}`}
            variant={ButtonVariantType.borderLess}
            size={ComponentSizeType.small}
            style={ButtonStyleType.default}
            ariaLabel="Add charts to deploy"
        />
    )

    const renderRemoveIcon = () => (
        <Button
            icon={<Icon name="ic-minus" size={null} color={null} />}
            onClick={removeChartTab}
            dataTestId={`chart-remove-${dataTestId}`}
            variant={ButtonVariantType.borderLess}
            size={ComponentSizeType.small}
            style={ButtonStyleType.default}
            showAriaLabelInTippy={selectedCount > 0}
            ariaLabel="Remove charts from selection"
        />
    )

    const renderIcon = () => (
        <div className="px-20 pt-20 pb-16 flexbox-col flex-grow-1">
            <div className="dc__border p-8 bg__primary br-8 dc__w-fit-content">
                <LazyImage
                    className={`${isListView ? 'dc__list-icon' : ''} dc__chart-grid-item__icon icon-dim-32`}
                    src={chart.icon}
                    onError={handleImageError}
                />
            </div>
        </div>
    )

    const renderCardInfo = () => (
        <div className="flexbox-col flex-grow-1 dc__gap-4 px-20 pb-16">
            <InteractiveCellText text={chart.name} rootClassName="fw-6 chart-grid-item__title" />
            {chart.deprecated && renderDeprecatedWarning()}

            <span className={`fw-4 fs-13 lh-20 ${chart.deprecated ? 'dc__truncate' : 'dc__truncate--clamp-2'}`}>
                {chart.description || 'No description'}
            </span>
        </div>
    )

    const renderFooter = () => (
        <div className="flex left dc__content-space dc__border-top-n1 px-20 py-16 dc__gap-6">
            <div className="flex dc__gap-6">
                <Icon name="ic-folder-color" size={16} color={null} />
                <InteractiveCellText
                    text={chart.chart_name ? chart.chart_name : chart.docker_artifact_store_id}
                    rootClassName="cn-4"
                />
            </div>
            <div className="fs-12 cn-7 dc__ellipsis-right__2nd-line lh-18 dc__no-shrink">v{chart.version}</div>
        </div>
    )
    return (
        <div
            key={chart.id}
            className={`chart-grid-item cursor dc__position-rel br-8 dc__border bg__primary ${isListView ? 'flexbox-col' : ''} ${
                showCheckBoxOnHoverOnly ? 'show-checkbox-onhover' : ''
            } ${selectedCount > 0 ? 'chart-grid-item--selected' : ''} `}
            onClick={onClick ? onClickChartSelect : noop}
            data-testid={`chart-card-${dataTestId}`}
        >
            <div>
                {renderIcon()}
                <div>
                    {serverMode === SERVER_MODE.FULL && addChart && subtractChart ? (
                        <div
                            className={`chart-grid__check devtron-stepper dc__grid ${selectedCount > 0 ? 'devtron-stepper-grid' : ''} `}
                        >
                            {selectedCount > 0 && (
                                <>
                                    {renderRemoveIcon()}

                                    <span className="devtron-stepper__item fs-13 icon-dim-20 px-4">
                                        {selectedCount}
                                    </span>
                                </>
                            )}

                            {renderAddIcon()}
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
                    {renderCardInfo()}
                </div>
            </div>
            {renderFooter()}
        </div>
    )
}

export default ChartCard
