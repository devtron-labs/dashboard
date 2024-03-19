import React, { useEffect, useMemo, useRef } from 'react'
import {
    Drawer,
    InfoColourBar,
    SearchBar,
    getCommonSelectStyle,
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
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { LinkedCIAppListFilterParams, LinkedCIDetailModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'
import { getAppList, getLinkedCIPipelineEnvironmentList } from './service'
import { LinkedCITippyContent, parseSearchParams } from './utils'
import { API_STATUS_CODES, SELECT_ALL_VALUE } from '../../../config'
import { NodeAttr } from '../../../components/app/details/triggerView/types'
import { DEFAULT_ALL_ENV, SortableKeys } from './constants'
import { preventBodyScroll } from '../../../components/common'

const LinkedCIDetailsModal = ({ handleClose, workflows }: LinkedCIDetailModalProps) => {
    const { ciPipelineId } = useParams<{ ciPipelineId: string }>()
    const commonStyles = getCommonSelectStyle()
    const selectedNode =
        workflows?.map((workflow) => workflow.nodes.find((node) => node.id === ciPipelineId))?.[0] ?? ({} as NodeAttr)

    const { title: ciPipelineName, linkedCount: linkedWorkflowCount } = selectedNode

    const urlFilters = useUrlFilters<SortableKeys, Pick<LinkedCIAppListFilterParams, 'environment'>>({
        initialSortKey: SortableKeys.appName,
        parseSearchParams,
    })
    const { pageSize, offset, searchKey, sortOrder, sortBy, handleSearch, environment, changePage, changePageSize } =
        urlFilters
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
    )
    const [envLoading, envList] = useAsync(() => getLinkedCIPipelineEnvironmentList(ciPipelineId))

    const updateEnvironmentFilter = (environmentOption: OptionType) => {
        urlFilters.updateSearchParams({
            environment: environmentOption.value,
        })
    }

    const selectOptions = [DEFAULT_ALL_ENV, ...(envList ?? []).map((env) => ({ label: env, value: env }))]

    const selectedOption = selectOptions.find((option) => option.value === environment) ?? {
        label: 'All Environments',
        value: SELECT_ALL_VALUE,
    }

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
                    <Drawer position="right" width="800px">
                        <div className="bcn-0 h-100 flex">
                            <ErrorScreenNotAuthorized />
                        </div>
                    </Drawer>
                )
            }
            return (
                <Drawer position="right" width="800px">
                    <Reload reload={reload} className="flex-grow-1 bcn-0" />
                </Drawer>
            )
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
                <Drawer position="right" width="800px">
                    <GenericEmptyState
                        title="The requested resource doesn't exist"
                        classname="flex-grow-1 bcn-0"
                        isButtonAvailable
                        renderButton={renderBackButton}
                    />
                </Drawer>
            )
        }
    }

    return (
        <Drawer position="right" width="800px">
            <div className="bcn-0 h-100 flexbox-col show-shimmer-loading">
                <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                    <div className="flex flex-justify dc__border-bottom pt-10 pr-20 pb-10 pl-20 dc__position-sticky">
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
                    <div className="flexbox-col flex-grow-1">
                        <InfoColourBar
                            message={LinkedCITippyContent(linkedWorkflowCount || 0)}
                            classname="info_bar dc__position-sticky"
                            Icon={Info}
                        />
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
                                styles={{
                                    ...commonStyles,
                                    control: (base, state) => ({
                                        ...commonStyles.control(base, state),
                                        width: 200,
                                        height: 32,
                                        minHeight: 32,
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 5,
                                    }),
                                }}
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
                {!showLoadingState && result.totalCount > DEFAULT_BASE_PAGE_SIZE ? (
                    <Pagination
                        rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top dc__no-shrink"
                        size={result.totalCount}
                        offset={offset}
                        pageSize={pageSize}
                        changePage={changePage}
                        changePageSize={changePageSize}
                    />
                ) : null}
            </div>
        </Drawer>
    )
}

export default LinkedCIDetailsModal
