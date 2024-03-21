import React, { useEffect, useMemo, useRef } from 'react'
import {
    InfoColourBar,
    SearchBar,
    useAsync,
    GenericEmptyState,
    useUrlFilters,
    OptionType,
    LoadingIndicator,
    abortPreviousRequests,
    getIsRequestAborted,
    ErrorScreenNotAuthorized,
    Reload,
    Pagination,
    DEFAULT_BASE_PAGE_SIZE,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { LinkedCIAppListFilterParams, LinkedCIDetailModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'
import { getAppList, getLinkedCIPipelineEnvironmentList } from './service'
import { getLinkedCITippyContent, parseSearchParams } from './utils'
import { API_STATUS_CODES, SELECT_ALL_VALUE } from '../../../config'
import { NodeAttr } from '../../../components/app/details/triggerView/types'
import { ALL_ENVIRONMENT_OPTION, SortableKeys, environmentFilterDropdownStyles } from './constants'
import { preventBodyScroll } from '../../../components/common'

const LinkedCIDetailsModal = ({ handleClose, workflows }: LinkedCIDetailModalProps) => {
    const { ciPipelineId } = useParams<{ ciPipelineId: string }>()

    const selectedNode =
        workflows
            ?.flatMap((workflow) => workflow.nodes)
            .find((node) => node.type === WorkflowNodeType.CI && node.id === ciPipelineId) ?? ({} as NodeAttr)

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
                    <div className="bcn-0 h-100 flex">
                        <ErrorScreenNotAuthorized />
                    </div>
                )
            }
            return <Reload reload={reload} className="flex-grow-1 bcn-0" />
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
                    classname="flex-grow-1 bcn-0"
                    isButtonAvailable
                    renderButton={renderBackButton}
                />
            )
        }
    }

    return (
        <div className="bcn-0 h-100 flexbox-col show-shimmer-loading">
            <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                <div className="dc__position-sticky dc__top-0 bcn-0 dc__zi-20">
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
                    <div className="flex flex-justify-start dc__gap-8 pl-20 pr-20 pt-8 pb-8 lh-20">
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
                        <ReactSelect
                            isDisabled={showLoadingState || envLoading}
                            styles={environmentFilterDropdownStyles}
                            options={selectOptions}
                            isLoading={envLoading}
                            onChange={updateEnvironmentFilter}
                            components={{
                                LoadingIndicator,
                                IndicatorSeparator: null,
                            }}
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
