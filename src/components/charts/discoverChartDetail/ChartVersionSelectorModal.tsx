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

import React, { useState } from 'react'
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Back } from '../../../assets/icons/ic-back.svg'
import { useDiscoverDetailsContext } from './DiscoverChartDetails'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ChartValuesType } from '../charts.types'
import { ChartVersionSelectorModalType, PrimaryOptionType } from './types'
import { PrimaryOptions, ValueType } from './constants'

export default function ChartVersionSelectorModal({
    closePopup,
    appStoreApplicationName,
    appIconUrl,
    onError,
    handleDeploy,
    deployedChartValueList,
    presetChartValueList,
}: ChartVersionSelectorModalType) {
    const { setChartValues } = useDiscoverDetailsContext()
    const [isListpage, setIsListPage] = useState(false)
    const [selectedValueType, setSelectedValueType] = useState<string>('')
    const [selectedChartValue, setSelectedChartValue] = useState<ChartValuesType>(null)

    const onClickActionCard = (valueType): void => {
        if (valueType === ValueType.NEW) {
            redirectToDeploy()
        } else {
            setSelectedValueType(valueType)
            togglePageState()
        }
    }

    const redirectToDeploy = (): void => {
        if (selectedChartValue) {
            setChartValues(selectedChartValue)
        }
        closePopup()
        handleDeploy()
    }

    const renderSubtitle = (cardDetail: PrimaryOptionType): JSX.Element => {
        if (cardDetail.valueType === ValueType.PRESET) {
            return (
                <div className="fw-4 fs-13 cn-7">
                    <span className="cr-5">{cardDetail.noDataSubtitle[0]}</span>&nbsp;
                    <a className="dc__link" href={cardDetail.helpLink} rel="noreferrer noopener" target="_blank">
                        {cardDetail.noDataSubtitle[1]}
                    </a>
                </div>
            )
        }
        if (cardDetail.valueType === ValueType.DEPLOYED) {
            return (
                <div className="fw-4 fs-13 cn-7">
                    <span className="cr-5">{cardDetail.noDataSubtitle[0]}</span>&nbsp;
                    <span>{cardDetail.noDataSubtitle[1]}</span>
                </div>
            )
        }
    }

    const createActionCard = (cardDetail: PrimaryOptionType): JSX.Element => {
        const Icon = cardDetail.icon
        const renderNoDataCard =
            (cardDetail.valueType === ValueType.DEPLOYED && deployedChartValueList.length === 0) ||
            (cardDetail.valueType === ValueType.PRESET && presetChartValueList.length === 0)
        return (
            <div
                key={cardDetail.valueType}
                className={`flex left br-4 pt-12 pr-16 pb-12 pl-16 mb-12 ml-20 mr-20 en-2 bw-1 ${
                    renderNoDataCard ? '' : 'pointer'
                }`}
                onClick={() => {
                    !renderNoDataCard && onClickActionCard(cardDetail.valueType)
                }}
            >
                <div className="h-60 ">
                    <Icon />
                </div>
                <div className={`ml-16 ${renderNoDataCard ? '' : 'mr-16'} flex-1`}>
                    <div className="fw-6 fs-13 cn-9">{cardDetail.title}</div>
                    {renderNoDataCard ? (
                        renderSubtitle(cardDetail)
                    ) : (
                        <div className="fw-4 fs-13 cn-7">{cardDetail.subtitle}</div>
                    )}
                </div>
                {!renderNoDataCard && <Dropdown className="icon-dim-20 rotate-270" />}
            </div>
        )
    }

    const renderValueTypeList = (): JSX.Element => {
        let emptyValue: PrimaryOptionType
        return (
            <>
                {PrimaryOptions.map((primaryOption) => {
                    if (
                        (primaryOption.valueType === ValueType.PRESET && presetChartValueList.length === 0) ||
                        (primaryOption.valueType === ValueType.DEPLOYED && deployedChartValueList.length === 0)
                    ) {
                        emptyValue = primaryOption
                        return null
                    }
                    return createActionCard(primaryOption)
                })}
                {emptyValue && createActionCard(emptyValue)}
            </>
        )
    }

    const renderInitialHeader = (): JSX.Element => {
        return (
            <div className="flex dc__content-start">
                <div className="h-44 mr-16">
                    <img src={appIconUrl} onError={onError} className="dc__chart-grid-item__icon" alt="chart icon" />
                </div>
                <div className="h-44">
                    <div className="fw-6 fs-16 cn-9 h-22 mb-2">Deploy {appStoreApplicationName}</div>
                    <div className="fw-4 fs-13 cn-9 h-20">Choose to start with...</div>
                </div>
            </div>
        )
    }

    const togglePageState = (): void => {
        setIsListPage(!isListpage)
        setSelectedChartValue(null)
    }

    const renderListHeader = (): JSX.Element => {
        return (
            <div className="flex dc__content-start">
                <button type="button" className="dc__transparent pl-16 pr-16" onClick={togglePageState}>
                    <Back className="icon-dim-20" />
                </button>
                <div>
                    <div className="fw-6 fs-16 cn-9">{appStoreApplicationName}</div>
                    <div className="fw-4 fs-13 cn-9">Select a {selectedValueType} value</div>
                </div>
            </div>
        )
    }
    const renderValueList = (): JSX.Element => {
        return (
            <div style={{ height: 'calc(100vh - 170px)' }}>
                <div className="chart-value-row fw-6 cn-7 fs-12 dc__border-top dc__border-bottom dc__uppercase pt-8 pr-16 pb-8 pl-16">
                    <div className="pr-16" />
                    <div className="pr-16">Name</div>
                    <div>Chart Version</div>
                </div>
                {(selectedValueType === 'preset' ? presetChartValueList : deployedChartValueList).map(
                    (valueDetail, index) => (
                        <div
                            key={`chart-value-${index}`}
                            className={`chart-value-row fw-4 cn-9 fs-13 pt-12 pr-16 pb-12 pl-16 ${
                                selectedChartValue?.id === valueDetail.id ? 'active' : ''
                            }`}
                            onClick={() => {
                                setSelectedChartValue(valueDetail)
                            }}
                        >
                            <div className="pr-16">
                                <File className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                            </div>
                            <div className="pr-16">{valueDetail.name}</div>
                            <div>{valueDetail.chartVersion}</div>
                        </div>
                    ),
                )}
            </div>
        )
    }
    const renderDeployButton = (): JSX.Element => {
        return (
            <div className="pt-20 pr-20 pb-20 pl-20 dc__border-top right-align">
                <button
                    type="button"
                    className="cta h-36 lh-36"
                    onClick={redirectToDeploy}
                    disabled={selectedChartValue === null}
                >
                    Edit & deploy
                    <Back className="icon-dim-20 rotate-180 dc__vertical-align-middle ml-5" />
                </button>
            </div>
        )
    }
    return (
        <VisibleModal className="transition-effect">
            <div
                className={`modal__body mt-0 dc__no-top-radius chart-version-selector p-0 ${
                    isListpage ? 'dc__no-bottom-radius' : ''
                }`}
            >
                <div className={`header-container mt-20 mr-20 mb-20 ${isListpage ? '' : 'ml-20'}`}>
                    {isListpage ? renderListHeader() : renderInitialHeader()}
                    <button type="button" className="dc__transparent" onClick={closePopup}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                {isListpage ? (
                    <>
                        {renderValueList()}
                        {renderDeployButton()}
                    </>
                ) : (
                    renderValueTypeList()
                )}
            </div>
        </VisibleModal>
    )
}
