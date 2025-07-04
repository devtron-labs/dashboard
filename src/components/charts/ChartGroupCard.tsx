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

import { Link } from 'react-router-dom'

import { getAlphabetIcon, handleAnalyticsEvent, Icon } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import ChartIcon from './ChartIcon'
import { getChartGroupURL } from './charts.helper'
import { ChartGroupCardProps } from './charts.types'
import { getChartGroupSubgroup, getDescriptionTruncate } from './charts.util'
import { CHART_CARD_MAX_LENGTH } from './constants'

export const ChartGroupCard = ({ chartGroup }: ChartGroupCardProps) => {
    const chartGroupEntries = getChartGroupSubgroup(chartGroup.chartGroupEntries)

    const GROUP_EDIT_LINK = getChartGroupURL(chartGroup.id)

    const renderCardInfo = () => (
        <div className="flexbox-col flex-grow-1 dc__gap-8">
            <div className="flexbox-col dc__gap-2">
                <div className="flex left">
                    <InteractiveCellText
                        text={chartGroup.name}
                        rootClassName="fw-6 chart-grid-item__title cn-9"
                        fontSize={14}
                    />
                    <div className="chart-name__arrow dc__no-shrink flex">
                        <Icon name="ic-caret-down-small" color="B500" rotateBy={270} />
                    </div>
                </div>
            </div>

            <span className={`fw-4 fs-13 lh-1-5 ${getDescriptionTruncate({})}`}>
                {chartGroup.description || 'No description'}
            </span>
        </div>
    )

    const handleClick = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CHART_GROUP_CARD_CLICKED' })
    }

    const renderFooter = () => (
        <div className="flex left dc__content-space dc__border-top-n1 px-20 py-16 dc__gap-6">
            <div className="flex">
                {getAlphabetIcon(chartGroup.createdBy)}
                <InteractiveCellText text={chartGroup.createdBy} rootClassName="cn-7 lh-1-5" fontSize={12} />
            </div>
            <span className="lh-20 dc__truncate m-0 dc__align-item-left cn-7 lh-1-5 dc__mxw-120 fs-12">
                {chartGroup.chartGroupEntries?.length || 0} charts
            </span>
        </div>
    )

    return (
        <Link
            key={chartGroup.id}
            className="chart-grid-item dc__visible-hover dc__visible-hover--parent bg__primary border__secondary-translucent cursor dc__position-rel br-8   "
            to={GROUP_EDIT_LINK}
            onClick={handleClick}
        >
            <div className="flexbox-col h-166 dc__gap-12 px-20 pt-20 pb-16">
                <div className="flexbox">
                    {chartGroupEntries?.length ? (
                        <>
                            {chartGroupEntries.map((chart) => (
                                <ChartIcon icon={chart.chartMetaData.icon} key={chart.id} isChartGroupCard />
                            ))}
                            {chartGroup.chartGroupEntries.length > CHART_CARD_MAX_LENGTH && (
                                <div className="flex chart-group-card__icon-wrapper border__secondary-translucent bg__secondary br-8 p-8 h-50 fs-16 lh-1-5 cn-8 icon-dim-50">
                                    +{chartGroup.chartGroupEntries.length - CHART_CARD_MAX_LENGTH}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="dc__border-dashed bg__secondary br-8 p-8 dc__w-fit-content h-50">
                            <Icon name="ic-folder-color" size={32} color={null} />
                        </div>
                    )}
                </div>
                {renderCardInfo()}
            </div>

            {renderFooter()}
        </Link>
    )
}
