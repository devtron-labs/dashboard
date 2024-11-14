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
import Tippy from '@tippyjs/react'
import { ReactComponent as QuestionIcon } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as File } from '../../../../../assets/icons/ic-file.svg'
import { ReactComponent as DefaultChart } from '../../../../../assets/icons/ic-default-chart.svg'
import { URLS } from '../../../../../config'
import { ChartUsedCardType } from '../environment.type'
import LoadingCard from '../../../../app/details/appDetails/LoadingCard'

const ChartUsedCard = ({ appDetails, notes, onClickShowNotes, cardLoading }: ChartUsedCardType) => {
    if (cardLoading) {
        return <LoadingCard />
    }

    return (
        <div data-testid="chart-used-card" className="app-details-info-card flex left bcn-0 br-8 mr-12 lh-20 w-200">
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content dc__ellipsis-right">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-9 mr-5" data-testid="chart-used-heading">
                            Chart used
                        </div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Chart used to deploy to this application"
                        >
                            <div className="flex">
                                <QuestionIcon className="icon-dim-16 mt-2" />
                            </div>
                        </Tippy>
                    </div>
                    <div className="fs-13 fw-6 dc__ellipsis-right" data-testid="full-chart-name-with-version">
                        <Link
                            className="cb-5 fw-6"
                            to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}
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
