import React, { useMemo } from 'react'
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
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import ReactSelect from 'react-select'
import { LinkedCIDetailModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'
import { getAppList, getEnvironmentList } from './service'
import EmptyStateImage from '../../../assets/img/empty-noresult@2x.png'
import { SortableKeys } from '../../GlobalConfigurations/Authorization/PermissionGroups/List/constants'
import { parseSearchParams } from './utils'
import { NodeAttr } from '../../../components/app/details/triggerView/types'

const commonStyles = getCommonSelectStyle()

const LinkedCIDetailsModal = ({ handleClose, workflows }: LinkedCIDetailModalProps) => {
    const { ciPipelineId } = useParams<{ ciPipelineId: string }>()

    const selectedNode =
        workflows.map((workflow) => workflow.nodes.find((node) => node.id === ciPipelineId))?.[0] ?? ({} as NodeAttr)

    const { title: ciPipelineName, linkedCount: linkedWorkflowCount } = selectedNode

    const renderCloseModalButton = () => {
        return (
            <button type="button" onClick={handleClose}>
                Close
            </button>
        )
    }

    const urlFilters = useUrlFilters<
        SortableKeys,
        {
            environment: string
        }
    >({ initialSortKey: SortableKeys.name, parseSearchParams })
    const { pageSize, offset, searchKey, sortOrder, handleSearch, environment } = urlFilters
    const filterConfig = useMemo(
        () => ({
            size: pageSize,
            offset,
            searchKey,
            sortOrder,
            environment,
        }),
        [pageSize, offset, searchKey, sortOrder, environment],
    )
    const [loading, result, error] = useAsync(() => getAppList(ciPipelineId, filterConfig), [filterConfig])
    const [envLoading, envList] = useAsync(() => getEnvironmentList(ciPipelineId))

    const updateEnvironmentFilter = (environmentOption: OptionType) => {
        urlFilters.updateSearchParams({
            environment: environmentOption.value,
        })
    }

    const selectOptions = [
        { label: 'All Environments', value: '*' },
        ...(envList ?? []).map((env) => ({ label: env, value: env })),
    ]
    if (error) {
        return (
            <Drawer position="right" width="800px">
                <GenericEmptyState
                    image={EmptyStateImage}
                    classname="bcn-0 h-100 flexbox-col flex-grow-1 fs-16"
                    title="No Results"
                    subTitle="We could not find any matching results"
                    isButtonAvailable
                    renderButton={renderCloseModalButton}
                />
            </Drawer>
        )
    }

    return (
        <Drawer position="right" width="800px">
            <div className="bcn-0 h-100 flexbox-col flex-grow-1 show-shimmer-loading dc__overflow-auto">
                <div className="flex flex-justify dc__border-bottom pt-12 pr-20 pb-12 pl-20 dc__position-sticky">
                    {loading ? (
                        <span className="h-24 w-250 child child-shimmer-loading" />
                    ) : (
                        <h2 className="fs-16 fw-6 lh-24 m-0 dc__ellipsis-right">{ciPipelineName}</h2>
                    )}
                    <button
                        type="button"
                        className="dc__transparent dc__no-shrink"
                        aria-label="close-modal"
                        onClick={handleClose}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                    {loading ? null : (
                        <InfoColourBar
                            message={`This build pipeline is linked as image source in ${linkedWorkflowCount} ${linkedWorkflowCount === 1 ? 'workflow' : 'workflows'}.`}
                            classname="info_bar"
                            Icon={Info}
                        />
                    )}
                    <div className="flex flex-justify-start dc__gap-8 pl-20 pr-20 pt-8 pb-8 lh-20">
                        <SearchBar
                            containerClassName="w-250"
                            inputProps={{
                                placeholder: 'Search application',
                                autoFocus: true,
                                disabled: loading,
                            }}
                            initialSearchText={searchKey}
                            handleEnter={handleSearch}
                        />
                        <div className="w-200">
                            <ReactSelect
                                isDisabled={loading || envLoading}
                                styles={{
                                    ...commonStyles,
                                    control: (base) => ({
                                        ...base,
                                        ...commonStyles.control,
                                        backgroundColor: 'var(--N50)',
                                    }),
                                }}
                                options={selectOptions}
                                isLoading={envLoading}
                                onChange={updateEnvironmentFilter}
                                components={{
                                    LoadingIndicator,
                                    IndicatorSeparator: null,
                                }}
                            />
                        </div>
                    </div>
                    <LinkedCIAppList
                        appList={result?.data || []}
                        totalCount={result?.totalCount || 0}
                        isLoading={loading}
                        urlFilters={urlFilters}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default LinkedCIDetailsModal
