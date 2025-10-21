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

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import { LoadingCard } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as DefaultChart } from '@Icons/ic-default-chart.svg'
import { ReactComponent as File } from '@Icons/ic-file.svg'
import { ReactComponent as QuestionIcon } from '@Icons/ic-question.svg'

import { URLS } from '../../../../../config'
import { ChartToolTipType, ChartUsedCardType } from '../environment.type'
import { getUsedChartContent } from '../utils'

const ChartToolTip = ({ children, isDeprecated, onClickUpgrade, chartRef }: ChartToolTipType) => (
    <Tippy
        className="default-tt w-200"
        arrow={false}
        placement="top"
        interactive
        content={getUsedChartContent(isDeprecated, onClickUpgrade)}
        appendTo={() => chartRef.current} // To fix the issue of tippy not showing the content outside the container
    >
        {children}
    </Tippy>
)

const ChartUsedCard = ({ appDetails, notes, onClickShowNotes, cardLoading, onClickUpgrade }: ChartUsedCardType) => {
    const chartRef = useRef(null)

    if (cardLoading) {
        return <LoadingCard />
    }

    return (
        <div
            data-testid="chart-used-card"
            className="app-details-info-card flex left bg__primary br-8 mr-12 lh-20 w-200"
            ref={chartRef}
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content dc__ellipsis-right">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div
                            className={`fs-12 fw-4 ${appDetails.deprecated ? 'cr-5' : 'cn-9'} mr-5`}
                            data-testid="chart-used-heading"
                        >
                            Chart {appDetails.deprecated ? 'deprecated' : 'used'}
                        </div>
                        <ChartToolTip
                            isDeprecated={appDetails.deprecated}
                            onClickUpgrade={onClickUpgrade}
                            chartRef={chartRef}
                        >
                            <div className="flex">
                                <QuestionIcon className="icon-dim-16 mt-2" />
                            </div>
                        </ChartToolTip>
                    </div>
                    <div className="fs-13 fw-6 dc__ellipsis-right" data-testid="full-chart-name-with-version">
                        <Link
                            className={`fw-6 ${appDetails.appStoreChartId ? 'cb-5' : 'cn-9'}`}
                            to={`${URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE_DISCOVER}/chart/${appDetails.appStoreChartId}`}
                            style={{ pointerEvents: !appDetails.appStoreChartId ? 'none' : 'auto' }}
                        >
                            {appDetails.appStoreAppName}
                        </Link>
                    </div>
                </div>
                {appDetails.chartAvatar ? (
                    <img
                        src={appDetails.chartAvatar}
                        alt={appDetails.appStoreAppName}
                        className="dc__chart-grid-item__icon icon-dim-24"
                    />
                ) : (
                    <DefaultChart className="icon-dim-24" />
                )}
            </div>
            <div className="app-details-info-card__bottom-container dc__content-space">
                <span className="app-details-info-card__bottom-container__message fs-12 fw-4">
                    Version {appDetails.appStoreAppVersion}
                </span>
                <div className="app-details-info-card__bottom-container__details fs-12 fw-6">
                    {notes && (
                        <div
                            className="details-hover flex cb-5 fw-6 cursor"
                            onClick={onClickShowNotes}
                            data-testid="notes.txt-heading"
                        >
                            <File className="app-notes__icon icon-dim-16 mr-4" /> Notes.txt
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChartUsedCard
