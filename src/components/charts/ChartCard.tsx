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

import { ReactComponent as ICCaretSmall } from '@Icons/ic-caret-left-small.svg'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import placeHolder from '../../assets/icons/ic-default-chart.svg'
import { SERVER_MODE } from '../../config'
import { LazyImage } from '../common'
import { ChartSelectProps } from './charts.types'
import { renderDeprecatedWarning } from './charts.util'

const ChartCard = ({
    chart,
    addChart,
    subtractChart,
    selectedCount = 0,
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

    const onClickChartSelect = (): void => {
        onClick(chart.id)
    }

    const renderAddIcon = () => (
        <div className={`${selectedCount > 0 ? 'dc__visible' : 'dc__border br-6'} dc__visible-hover--child h-28`}>
            <Button
                icon={<Icon name="ic-add" size={null} color={null} />}
                onClick={addChartTab}
                dataTestId={`chart-add-${dataTestId}`}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.small}
                style={ButtonStyleType.default}
                ariaLabel="Add charts to deploy"
            />
        </div>
    )

    const renderRemoveIcon = () => (
        <Button
            icon={<Icon name="ic-minus" size={null} color={null} />}
            onClick={removeChartTab}
            dataTestId={`chart-remove-${dataTestId}`}
            variant={ButtonVariantType.borderLess}
            size={ComponentSizeType.small}
            style={ButtonStyleType.negativeGrey}
            showAriaLabelInTippy={selectedCount > 0}
            ariaLabel="Remove charts from selection"
        />
    )

    const renderIcon = () => (
        <div className={`${isListView ? 'flex' : 'px-20 pt-16 pb-12'}`}>
            <div className="icon-wrapper">
                <LazyImage
                    className={`${isListView ? 'dc__list-icon' : ''} dc__chart-grid-item__icon chart-icon-dim`}
                    src={chart.icon}
                    onError={handleImageError}
                />
            </div>
        </div>
    )

    const renderCardInfo = () => (
        <div className={`flexbox-col flex-grow-1 dc__gap-8 pb-16  ${isListView ? 'pt-20' : 'px-20'}`}>
            <div className="flexbox-col dc__gap-2">
                <div className="flex left">
                    <InteractiveCellText
                        text={chart.name}
                        rootClassName="fw-6 chart-grid-item__title cn-9"
                        fontSize={14}
                    />
                    <div className="chart-name__arrow dc__no-shrink flex">
                        <ICCaretSmall className="icon-dim-16 dc__flip-180 scb-5" />
                    </div>
                </div>
                {chart.deprecated && renderDeprecatedWarning()}
            </div>

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
                    rootClassName="cn-7"
                    fontSize={12}
                />
            </div>
            <div className="fs-12 cn-7 dc__ellipsis-right__2nd-line lh-18 dc__no-shrink">v{chart.version}</div>
        </div>
    )
    return (
        <div
            key={chart.id}
            className={`chart-grid-item dc__visible-hover dc__visible-hover--parent bg__primary border__secondary-translucent cursor dc__position-rel br-8 ${isListView ? 'flexbox-col' : ''} ${selectedCount > 0 ? 'chart-grid-item--selected' : ''} `}
            onClick={onClick ? onClickChartSelect : noop}
            data-testid={`chart-card-${dataTestId}`}
        >
            <div className={`${isListView ? 'dc__grid chart-list-item px-20 dc__gap-16' : 'h-164'}`}>
                {renderIcon()}
                <div className={`${isListView ? 'dc__gap-16' : ''}`}>
                    {serverMode === SERVER_MODE.FULL && addChart && subtractChart && (
                        <div
                            className={`devtron-stepper ${selectedCount > 0 ? 'dc__grid devtron-stepper-grid dc__border  br-6 fw-6 cursor bg__primary' : ''}`}
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
                    )}
                    {renderCardInfo()}
                </div>
            </div>
            {renderFooter()}
        </div>
    )
}

export default ChartCard
