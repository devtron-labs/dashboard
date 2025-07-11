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

import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    EMPTY_STATE_STATUS,
    GenericEmptyState,
    Icon,
    ImageType,
    InfoBlock,
    Progressing,
    SearchBar,
    showError,
    stopPropagation,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as SyncIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import EmptyFolder from '../../../assets/img/empty-folder.webp'
import NoResults from '../../../assets/img/empty-noresult@2x.png'
import { URLS } from '../../../config'
import { TOAST_INFO } from '../../../config/constantMessaging'
import { reSyncChartRepo } from '../../chartRepo/chartRepo.service'
import { ChartListPopUpType } from '../charts.types'
import AddChartSource from './AddChartSource'
import ChartListPopUpRow from './ChartListPopUpRow'

const ChartListPopUp = ({
    onClose,
    chartList,
    filteredChartList,
    isLoading,
    setFilteredChartList,
    setShowSourcePopUp,
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
            setShowSourcePopUp(false)
        }
    }

    const closeChartPopUpOnly = (e) => {
        stopPropagation(e)
        setShowAddPopUp(false)
    }

    const toggleEnabled = (key: string) => (enabled: boolean) =>
        setChartActiveMap({ ...chartActiveMap, [key]: enabled })

    const refetchCharts = async () => {
        if (fetching) {
            return
        }
        setFetching(true)
        await reSyncChartRepo()
            .then(() => {
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

    const renderChartListHeaders = () => (
        <div className="px-16 py-12 flex dc__content-space dc__border-bottom fw-6">
            <span>Helm chart sources</span>
            <div className="flex dc__gap-12">
                <AddChartSource text="Add" />

                <Button
                    icon={<SyncIcon />}
                    onClick={refetchCharts}
                    disabled={fetching}
                    isLoading={fetching}
                    size={ComponentSizeType.xxs}
                    variant={ButtonVariantType.borderLess}
                    dataTestId="chart-store-refetch-button"
                    ariaLabel="Refetch charts"
                />
                <div className="dc__divider" />
                <Button
                    icon={<Icon name="ic-close-large" size={16} color={null} />}
                    onClick={onClose}
                    size={ComponentSizeType.xxs}
                    variant={ButtonVariantType.borderLess}
                    dataTestId="chart-store-close-button"
                    showAriaLabelInTippy={false}
                    ariaLabel="Close"
                    style={ButtonStyleType.negativeGrey}
                />
            </div>
        </div>
    )

    const renderInfoText = (isEmptyState?: boolean): JSX.Element => {
        const renderNavigationeToOCIRepository = () => (
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

    const renderEmptyState = (noChartFound?: boolean) => (
        <GenericEmptyState
            image={noChartFound ? NoResults : EmptyFolder}
            title={noChartFound ? `No result for "${searchText}"` : EMPTY_STATE_STATUS.CHART.NO_SOURCE_TITLE}
            subTitle={noChartFound ? EMPTY_STATE_STATUS.CHART.NO_CHART_FOUND : renderInfoText(true)}
            imageType={ImageType.Medium}
        />
    )

    const renderChartList = () => {
        if (isEmpty && !!searchText && !filteredChartList.length) {
            return renderEmptyState(true)
        }
        return (
            <div className="dc__overflow-auto h-100 mxh-390-imp">
                {filteredChartList.map(
                    (list, index) =>
                        list.id !== 1 && (
                            <ChartListPopUpRow
                                key={list.name}
                                index={index}
                                list={list}
                                enabled={chartActiveMap[list.name]}
                                toggleEnabled={toggleEnabled(list.name)}
                            />
                        ),
                )}
                <div className="m-16">
                    <InfoBlock variant="help" description={renderInfoText()} />
                </div>
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

    const renderChartListSearch = () => (
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
