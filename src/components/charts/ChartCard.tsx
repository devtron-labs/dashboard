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
    handleAnalyticsEvent,
    Icon,
    ImageWithFallback,
    noop,
    stopPropagation,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import { ReactComponent as Helm } from '../../assets/icons/ic-default-chart.svg'
import { SERVER_MODE } from '../../config'
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

    const addChartTab = (e): void => {
        stopPropagation(e)
        addChart(chart.id)
        handleAnalyticsEvent({ category: 'Chart store add icon', action: 'CS_BULK_DEPLOY_ADD_CHART' })
    }

    const removeChartTab = (e): void => {
        stopPropagation(e)
        subtractChart(chart.id)
        handleAnalyticsEvent({ category: 'Chart store remove icon', action: 'CS_BULK_DEPLOY_REMOVE_CHART' })
    }

    const onClickChartSelect = (): void => {
        onClick(chart.id)
        handleAnalyticsEvent({ category: 'Chart store card', action: 'CS_CHART_CARD_CLICKED' })
    }

    const renderAddIcon = () => (
        <div className={`${selectedCount > 0 ? 'dc__visible' : 'dc__border br-6'} dc__visible-hover--child`}>
            <Button
                icon={<Icon name="ic-add" size={null} color={null} />}
                onClick={addChartTab}
                dataTestId={`chart-add-${dataTestId}`}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.small}
                style={ButtonStyleType.default}
                ariaLabel="Add chart to selection"
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
            ariaLabel="Remove chart from selection"
        />
    )
    const chartIconClass = 'dc__chart-grid-item__icon chart-icon-dim br-4 dc__no-shrink'

    const renderIcon = () => (
        <div className="icon-wrapper">
            <ImageWithFallback
                imageProps={{
                    height: 32,
                    width: 32,
                    src: chart.icon,
                    alt: 'chart',
                    className: chartIconClass,
                }}
                fallbackImage={<Helm className={chartIconClass} />}
            />
        </div>
    )

    const getDescriptionTruncate = () => {
        if (isListView) {
            return 'dc__truncate--clamp-4'
        }

        if (chart.deprecated) return 'dc__truncate'
        return 'dc__truncate--clamp-2'
    }

    const renderCardInfo = () => (
        <div className="flexbox-col flex-grow-1 dc__gap-8">
            <div className="flexbox-col dc__gap-2">
                <div className="flex left">
                    <InteractiveCellText
                        text={chart.name}
                        rootClassName="fw-6 chart-grid-item__title cn-9"
                        fontSize={14}
                    />
                    <div className="chart-name__arrow dc__no-shrink flex">
                        <Icon name="ic-caret-down-small" color="B500" rotateBy={270} />
                    </div>
                </div>
                {chart.deprecated && renderDeprecatedWarning()}
            </div>

            <span className={`fw-4 fs-13 lh-1-5 ${getDescriptionTruncate()}`}>
                {chart.description || 'No description'}
            </span>
        </div>
    )

    const renderFooter = () => (
        <div className="flex left dc__content-space dc__border-top-n1 px-20 py-16 dc__gap-6">
            <div className="flex dc__gap-6">
                <Icon name="ic-folder-color" size={18} color={null} />
                <InteractiveCellText
                    text={chart.chart_name ? chart.chart_name : chart.docker_artifact_store_id}
                    rootClassName="cn-7 lh-1-5"
                    fontSize={12}
                />
            </div>
            <InteractiveCellText
                text={`v${chart.version}`}
                rootClassName={`cn-7 lh-1-5 ${isListView ? 'dc__mxw-250' : 'dc__mxw-120'}`}
                fontSize={12}
            />
        </div>
    )
    return (
        <div
            key={chart.id}
            className={`chart-grid-item dc__visible-hover dc__visible-hover--parent bg__primary border__secondary-translucent cursor dc__position-rel br-8 ${isListView ? 'flexbox-col' : ''} ${selectedCount > 0 ? 'chart-grid-item--selected' : ''} `}
            onClick={onClick ? onClickChartSelect : noop}
            data-testid={`chart-card-${dataTestId}`}
        >
            <div
                className={`${isListView ? 'dc__grid chart-list-item dc__gap-16' : 'flexbox-col h-166 dc__gap-12'} px-20 pt-20 pb-16`}
            >
                {renderIcon()}
                {serverMode === SERVER_MODE.FULL && addChart && subtractChart && (
                    <div
                        className={`devtron-stepper ${selectedCount > 0 ? 'dc__grid devtron-stepper-grid dc__border  br-6 fw-6 cursor bg__primary' : ''}`}
                    >
                        {selectedCount > 0 && (
                            <>
                                {renderRemoveIcon()}

                                <span className="devtron-stepper__item fs-13 icon-dim-20 px-4">{selectedCount}</span>
                            </>
                        )}

                        {renderAddIcon()}
                    </div>
                )}
                {renderCardInfo()}
            </div>
            {renderFooter()}
        </div>
    )
}

export default ChartCard
