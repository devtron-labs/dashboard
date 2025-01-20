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

import { useEffect, useMemo, useRef } from 'react'
import {
    InfoColourBar,
    SearchBar,
    useAsync,
    GenericEmptyState,
    useUrlFilters,
    OptionType,
    abortPreviousRequests,
    getIsRequestAborted,
    ErrorScreenNotAuthorized,
    Reload,
    Pagination,
    DEFAULT_BASE_PAGE_SIZE,
    WorkflowNodeType,
    CommonNodeAttr,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { LinkedCIAppListFilterParams, LinkedCIDetailModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'
import { getAppList, getLinkedCIPipelineEnvironmentList } from './service'
import { getLinkedCITippyContent, parseSearchParams } from './utils'
import { API_STATUS_CODES, SELECT_ALL_VALUE } from '../../../config'
import { ALL_ENVIRONMENT_OPTION, SortableKeys } from './constants'
import { preventBodyScroll } from '../../../components/common'

const LinkedCIDetailsModal = ({ handleClose, workflows }: LinkedCIDetailModalProps) => {
    const { ciPipelineId } = useParams<{ ciPipelineId: string }>()

    const selectedNode =
        workflows
            ?.flatMap((workflow) => workflow.nodes)
            .find((node) => node.type === WorkflowNodeType.CI && node.id === ciPipelineId) ?? ({} as CommonNodeAttr)

    const { title: ciPipelineName, linkedCount: linkedWorkflowCount = 0 } = selectedNode

    const urlFilters = useUrlFilters<SortableKeys, Pick<LinkedCIAppListFilterParams, 'environment'>>({
        initialSortKey: SortableKeys.appName,
        parseSearchParams,
    })
    const {
        pageSize,
        offset,
        searchKey,
        sortOrder,
        sortBy,
        handleSearch,
        environment,
        changePage,
        changePageSize,
        updateSearchParams,
    } = urlFilters
    const filterConfig = useMemo(
        () => ({
            size: pageSize,
            offset,
            searchKey,
            environment,
            sortOrder,
            sortBy,
        }),
        [pageSize, offset, searchKey, sortOrder, sortBy, environment],
    )

    const abortControllerRef = useRef(new AbortController())
    const [loading, result, error, reload] = useAsync(
        () =>
            abortPreviousRequests(
                () => getAppList(ciPipelineId, filterConfig, abortControllerRef.current.signal),
                abortControllerRef,
            ),
        [filterConfig],
        true,
        {
            resetOnChange: false,
        },
    )
    const [envLoading, envList] = useAsync(
        () => getLinkedCIPipelineEnvironmentList(ciPipelineId),
        [ciPipelineId],
        !!result,
    )

    const updateEnvironmentFilter = (environmentOption: OptionType) => {
        updateSearchParams({
            environment: environmentOption.value,
        })
    }

    const selectOptions = [ALL_ENVIRONMENT_OPTION, ...(envList ?? []).map((env) => ({ label: env, value: env }))]

    const selectedOption = selectOptions.find((option) => option.value === environment) ?? ALL_ENVIRONMENT_OPTION

    useEffect(() => {
        preventBodyScroll(true)

        return () => {
            preventBodyScroll(false)
        }
    }, [])

    const showLoadingState = loading || getIsRequestAborted(error)

    if (!showLoadingState) {
        if (error) {
            if (error.code === API_STATUS_CODES.PERMISSION_DENIED) {
                return (
                    <div className="bg__primary h-100 flex">
                        <ErrorScreenNotAuthorized />
                    </div>
                )
            }
            return <Reload reload={reload} className="flex-grow-1 bg__primary" />
        }

        const areFiltersApplied = searchKey || (environment && environment !== SELECT_ALL_VALUE)

        // The null state is shown only when filters are not applied
        if (result.totalCount === 0 && !areFiltersApplied) {
            const renderBackButton = () => (
                <button type="button" onClick={handleClose} className="cta secondary flex h-32">
                    Go back
                </button>
            )

            return (
                <GenericEmptyState
                    title="The requested resource doesn't exist"
                    classname="flex-grow-1 bg__primary"
                    isButtonAvailable
                    renderButton={renderBackButton}
                />
            )
        }
    }

    return (
        <div className="bg__primary h-100 flexbox-col show-shimmer-loading">
            <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                <div className="dc__position-sticky dc__top-0 bg__primary dc__zi-20">
                    <div className="flex flex-justify dc__border-bottom pt-10 pr-20 pb-10 pl-20">
                        <h2 className="fs-16 fw-6 lh-24 m-0 dc__ellipsis-right">{ciPipelineName}</h2>
                        <button
                            type="button"
                            className="dc__transparent dc__no-shrink flexbox"
                            aria-label="close-modal"
                            onClick={handleClose}
                            disabled={showLoadingState}
                        >
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <InfoColourBar
                        message={getLinkedCITippyContent(linkedWorkflowCount)}
                        classname="bcb-1 dc__border-bottom--b2"
                        Icon={Info}
                    />
                </div>
                <div className="flexbox-col flex-grow-1">
                    <div className="flex flex-justify-start dc__gap-8 pl-20 pr-20 pt-8 pb-8 lh-20 dc__zi-5">
                        <SearchBar
                            containerClassName="w-250"
                            inputProps={{
                                placeholder: 'Search application',
                                autoFocus: true,
                                disabled: showLoadingState,
                            }}
                            initialSearchText={searchKey}
                            handleEnter={handleSearch}
                        />
                        <SelectPicker
                            inputId="linked-ci-environment-dropdown"
                            isDisabled={showLoadingState || envLoading}
                            options={selectOptions}
                            isLoading={envLoading}
                            onChange={updateEnvironmentFilter}
                            value={selectedOption}
                        />
                    </div>
                    <LinkedCIAppList
                        appList={result?.data || []}
                        totalCount={result?.totalCount || 0}
                        isLoading={showLoadingState}
                        urlFilters={urlFilters}
                    />
                </div>
            </div>
            {!showLoadingState && result.totalCount > DEFAULT_BASE_PAGE_SIZE && (
                <Pagination
                    rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top dc__no-shrink"
                    size={result.totalCount}
                    offset={offset}
                    pageSize={pageSize}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )}
        </div>
    )
}

export default LinkedCIDetailsModal
