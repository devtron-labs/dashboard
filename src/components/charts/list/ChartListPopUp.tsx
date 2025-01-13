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
import {
    showError,
    Progressing,
    InfoColourBar,
    GenericEmptyState,
    ImageType,
    stopPropagation,
    SearchBar,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { NavLink } from 'react-router-dom'
import { ChartListPopUpType } from '../charts.types'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { EMPTY_STATE_STATUS, TOAST_INFO } from '../../../config/constantMessaging'
import { reSyncChartRepo } from '../../chartRepo/chartRepo.service'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { URLS } from '../../../config'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import EmptyFolder from '../../../assets/img/Empty-folder.png'
import NoResults from '../../../assets/img/empty-noresult@2x.png'
import AddChartSource from './AddChartSource'
import ChartListPopUpRow from './ChartListPopUpRow'
import { ReactComponent as SyncIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'

const ChartListPopUp = ({
    onClose,
    chartList,
    filteredChartList,
    isLoading,
    setFilteredChartList,
    setShowSourcePopoUp,
    chartActiveMap,
    setChartActiveMap,
}: ChartListPopUpType) => {
    const [searchText, setSearchText] = useState<string>('')
    const [fetching, setFetching] = useState<boolean>(false)
    const [showAddPopUp, setShowAddPopUp] = useState<boolean>(false)
    const isEmpty = chartList.length && !filteredChartList.length

    const closeChartPopUpModalOnBlur = (e) => {
        stopPropagation(e)
        if (showAddPopUp) {
            setShowAddPopUp(false)
        } else {
            setShowSourcePopoUp(false)
        }
    }

    const closeChartPopUpOnly = (e) => {
        stopPropagation(e)
        setShowAddPopUp(false)
    }

    const toggleAddPopUp = (event: React.MouseEvent): void => {
        stopPropagation(event)
        setShowAddPopUp(!showAddPopUp)
    }

    const toggleEnabled = (key: string) => (enabled: boolean) =>
        setChartActiveMap({ ...chartActiveMap, [key]: enabled })

    const renderChartListHeaders = () => {
        return (
            <div className="px-16 py-12 flex dc__content-space dc__border-bottom fw-6">
                <span>Helm chart sources</span>
                <div className="flex dc__gap-12">
                    <div className="flex cb-5 fw-6 cursor dc__gap-4" onClick={toggleAddPopUp}>
                        <Add className="icon-dim-20 fcb-5" />
                        Add
                    </div>
                    {renderGlobalRefetch()}
                    <div className="dc__divider" />
                    <button className="dc__transparent flex" onClick={onClose}>
                        <Close className="dc__page-header__close-icon icon-dim-20 cursor" />
                    </button>
                </div>
                {showAddPopUp && <AddChartSource />}
            </div>
        )
    }

    async function refetchCharts(e) {
        if (fetching) {
            return
        }
        setFetching(true)
        await reSyncChartRepo()
            .then((response) => {
                setFetching(false)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: TOAST_INFO.RE_SYNC,
                })
            })
            .catch((error) => {
                showError(error)
                setFetching(false)
            })
    }

    const renderInfoText = (isEmptyState?: boolean): JSX.Element => {
        const renderNavigationeToOCIRepository = () => {
            return (
                <>
                    <NavLink className="ml-4 mr-4" to={URLS.GLOBAL_CONFIG_CHART}>
                        Chart repositories
                    </NavLink>
                    or
                    <NavLink className="ml-4 mr-4" to={URLS.GLOBAL_CONFIG_DOCKER}>
                        OCI Registries
                    </NavLink>
                </>
            )
        }
        return (
            <div>
                {isEmptyState ? (
                    <>Add a {renderNavigationeToOCIRepository()} to view and deploy helm charts.</>
                ) : (
                    <>
                        Showing Chart repositories and OCI Registries (used as chart repositories). You can add other{' '}
                        {renderNavigationeToOCIRepository()} as chart sources.
                    </>
                )}
            </div>
        )
    }

    const renderGlobalRefetch = () => {
        return (
            <Tippy className="default-tt" arrow={false} placement="top" content="Refetch charts from all resources">
                <a
                    rel="noreferrer noopener"
                    target="_blank"
                    className={`chartRepo_form__subtitle dc__float-right dc__link flex ${!fetching ? 'cursor' : ''}`}
                    onClick={refetchCharts}
                >
                    <div className="flex">{fetching ? <Progressing size={16} /> : <SyncIcon />}</div>
                </a>
            </Tippy>
        )
    }

    const renderChartList = () => {
        if (isEmpty) {
            return renderEmptyState(true)
        }
        return (
            <div className="dc__overflow-scroll h-100 mxh-390-imp">
                {filteredChartList.map((list, index) => {
                    return (
                        list.id != 1 && (
                            <ChartListPopUpRow
                                key={list.name}
                                index={index}
                                list={list}
                                enabled={chartActiveMap[list.name]}
                                toggleEnabled={toggleEnabled(list.name)}
                            />
                        )
                    )
                })}
                <InfoColourBar
                    message={renderInfoText()}
                    classname="question-bar m-16"
                    Icon={Help}
                    iconClass="icon-dim-20 fcv-5"
                />
            </div>
        )
    }

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = chartList.filter((cluster) => cluster.name.indexOf(_searchText.toLowerCase()) >= 0)
        setFilteredChartList(_filteredData)
    }

    const handleFilterKeyPress = (searchKey: string): void => {
        handleFilterChanges(searchKey)
        setSearchText(searchKey)
    }

    const renderChartListSearch = () => {
        return (
            <div className="p-12">
                <SearchBar
                    initialSearchText={searchText}
                    containerClassName="dc__mxw-250 flex-grow-1 max-w-100"
                    handleEnter={handleFilterKeyPress}
                    inputProps={{
                        placeholder: 'Search by repository or registry',
                        autoFocus: true,
                    }}
                    dataTestId="chart-store-search-box"
                />
            </div>
        )
    }

    const renderEmptyState = (noChartFound?: boolean) => {
        return (
            <GenericEmptyState
                image={noChartFound ? NoResults : EmptyFolder}
                title={noChartFound ? <>No result for "{searchText}"</> : EMPTY_STATE_STATUS.CHART.NO_SOURCE_TITLE}
                subTitle={noChartFound ? EMPTY_STATE_STATUS.CHART.NO_CHART_FOUND : renderInfoText(true)}
                imageType={ImageType.Medium}
            />
        )
    }

    const renderChartListBody = () => {
        if (isLoading) {
            return (
                <div className="mh-400 flex column">
                    <Progressing size={24} />
                    <span className="dc__loading-dots mt-12">Loading Chart source</span>
                </div>
            )
        }
        if (!chartList.length) {
            return renderEmptyState()
        }
        return (
            <div>
                {renderChartListSearch()}
                {renderChartList()}
            </div>
        )
    }

    const onClickChartListPopUp = (e) => {
        stopPropagation(e)
        closeChartPopUpOnly(e)
    }

    return (
        <div className="dc__transparent-div" onClick={closeChartPopUpModalOnBlur}>
            <div
                className="chart-store__list h-100 w-400 br-4 bg__primary en-2 bw-1 fw-4 fs-13 dc__overflow-hidden"
                onClick={onClickChartListPopUp}
            >
                {renderChartListHeaders()}
                {renderChartListBody()}
            </div>
        </div>
    )
}

export default ChartListPopUp
