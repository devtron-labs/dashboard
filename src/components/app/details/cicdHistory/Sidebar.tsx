import React, { useEffect, useRef } from 'react'
import { ConditionalWrap, createGitCommitUrl } from '../../../common'
import { useRouteMatch, useParams, useHistory, generatePath, useLocation } from 'react-router'
import ReactSelect from 'react-select'
import { Option, DropdownIndicator } from '../../../v2/common/ReactSelect.utils'
import moment from 'moment'
import { Moment12HourFormat, SourceTypeMap } from '../../../../config'
import { CiPipelineSourceConfig } from '../../../ciPipeline/CiPipelineSourceConfig'
import {
    CICDSidebarFilterOptionType,
    GitTriggers,
    HistoryComponentType,
    HistorySummaryCardType,
    SidebarType,
    SummaryTooltipCardType,
} from './types'
import TippyHeadless from '@tippyjs/react/headless'
import { NavLink } from 'react-router-dom'
import { statusColor as colorMap } from '../../config'
import { ReactComponent as Docker } from '../../../../assets/icons/misc/docker.svg'
import ReactGA from 'react-ga4'
import DetectBottom from '../../../common/DetectBottom'
import { FILTER_STYLE, HISTORY_LABEL } from './Constants'
import { triggerStatus } from './History.components'

const Sidebar = React.memo(
    ({ type, filterOptions, triggerHistory, hasMore, setPagination, singleView }: SidebarType) => {
        const { pipelineId, appId, envId } = useParams<{ appId: string; envId: string; pipelineId: string }>()
        const { push } = useHistory()
        const { path } = useRouteMatch()

        const handleFilterChange = (selectedFilter: CICDSidebarFilterOptionType): void => {
            if (type === HistoryComponentType.CI) {
                setPagination({ offset: 0, size: 20 })
                push(generatePath(path, { appId, pipelineId: selectedFilter.value }))
            } else if (type === HistoryComponentType.GROUP_CI) {
                setPagination({ offset: 0, size: 20 })
                push(generatePath(path, { envId, pipelineId: selectedFilter.pipelineId }))
            } else if (type === HistoryComponentType.GROUP_CD) {
                setPagination({ offset: 0, size: 20 })
                push(generatePath(path, { envId, appId: selectedFilter.value, pipelineId: selectedFilter.pipelineId }))
            } else {
                setPagination({ offset: 0, size: 20 })
                push(generatePath(path, { appId, envId: selectedFilter.value, pipelineId: selectedFilter.pipelineId }))
            }
        }
        function reloadNextAfterBottom() {
            ReactGA.event({
                category: 'pagination',
                action: 'scroll',
                label: `${type.toLowerCase()}-history`,
                value: triggerHistory.size,
            })
            setPagination({ offset: triggerHistory.size, size: 20 })
        }

        const filterOptionType = () => {
            if (type === HistoryComponentType.CI || type === HistoryComponentType.GROUP_CI) {
                return pipelineId
            } else if (type === HistoryComponentType.GROUP_CD) {
                return appId
            } else {
                return envId
            }
        }

        const selectedFilter = filterOptions?.find((filterOption) => filterOption.value === filterOptionType()) ?? null
        filterOptions?.sort((a, b) => (a.label > b.label ? 1 : -1))
        const _filterOptions = filterOptions?.filter((filterOption) => !filterOption.deploymentAppDeleteRequest)

        const selectLabel = () => {
            if (type === HistoryComponentType.GROUP_CI || type === HistoryComponentType.GROUP_CD) {
                return HISTORY_LABEL.APPLICATION
            } else if (type === HistoryComponentType.CI) {
                return HISTORY_LABEL.PIPELINE
            } else {
                return HISTORY_LABEL.ENVIRONMENT
            }
        }
        return (
            <>
                <div
                    className="select-pipeline-wrapper w-100 pl-16 pr-16 dc__overflow-hidden"
                    style={{
                        borderBottom: '1px solid var(--n-100, #EDF1F5)',
                    }}
                >
                    <label className="form__label" data-testid="select-history-heading">
                        Select {selectLabel()}
                    </label>
                    <ReactSelect
                        classNamePrefix="history-pipeline-dropdown"
                        value={selectedFilter}
                        options={
                            type === HistoryComponentType.CI || type === HistoryComponentType.GROUP_CI
                                ? filterOptions
                                : _filterOptions
                        }
                        onChange={handleFilterChange}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        styles={FILTER_STYLE}
                        menuPortalTarget={document.body}
                    />
                </div>

                {singleView && <ViewAllCardsTile />}

                <div className="flex column top left" style={{ overflowY: 'auto' }}>
                    {Array.from(triggerHistory)
                        .sort(([a], [b]) => b - a)
                        .map(([triggerId, triggerDetails], index) => (
                            <HistorySummaryCard
                                dataTestId={`deployment-history-${index}`}
                                key={triggerId}
                                id={triggerId}
                                status={triggerDetails.status}
                                startedOn={triggerDetails.startedOn}
                                triggeredBy={triggerDetails.triggeredBy}
                                triggeredByEmail={triggerDetails.triggeredByEmail}
                                ciMaterials={triggerDetails.ciMaterials}
                                gitTriggers={triggerDetails.gitTriggers}
                                artifact={triggerDetails.artifact}
                                stage={triggerDetails.stage}
                                type={type}
                            />
                        ))}
                    {hasMore && !singleView && <DetectBottom callback={reloadNextAfterBottom} />}
                </div>
            </>
        )
    },
)

export default Sidebar

const HistorySummaryCard = React.memo(
    ({
        id,
        status,
        startedOn,
        triggeredBy,
        triggeredByEmail,
        ciMaterials,
        gitTriggers,
        artifact,
        type,
        stage,
        dataTestId,
    }: HistorySummaryCardType): JSX.Element => {
        const { path, params } = useRouteMatch()
        const { pathname } = useLocation()
        const currentTab = pathname.split('/').pop()
        const { triggerId, envId, ...rest } = useParams<{ triggerId: string; envId: string }>()
        const isCDType: boolean = type === HistoryComponentType.CD || type === HistoryComponentType.GROUP_CD
        const idName = isCDType ? 'triggerId' : 'buildId'

        const targetCardRef = useRef(null)

        const getPath = (): string => {
            const _params = {
                ...rest,
                envId,
                [idName]: id,
            }
            return `${generatePath(path, _params)}/${currentTab}`
        }

        useEffect(() => {
            scrollToElement()
        }, [targetCardRef])

        const activeID = params[idName]
        const scrollToElement = () => {
            if (targetCardRef?.current) {
                targetCardRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }
        return (
            <ConditionalWrap
                condition={Array.isArray(ciMaterials)}
                wrap={(children) => (
                    <TippyHeadless
                        placement="right"
                        interactive
                        render={() => (
                            <SummaryTooltipCard
                                status={status}
                                startedOn={startedOn}
                                triggeredBy={triggeredBy}
                                triggeredByEmail={triggeredByEmail}
                                ciMaterials={ciMaterials}
                                gitTriggers={gitTriggers}
                            />
                        )}
                    >
                        {children}
                    </TippyHeadless>
                )}
            >
                <NavLink
                    to={getPath}
                    className="w-100 ci-details__build-card-container"
                    data-testid={dataTestId}
                    activeClassName="active"
                    ref={+activeID === +id && targetCardRef}
                >
                    <div className="w-100 ci-details__build-card">
                        <div
                            className={`dc__app-summary__icon icon-dim-20 ${triggerStatus(status)
                                ?.toLocaleLowerCase()
                                .replace(/\s+/g, '')}`}
                        />
                        <div className="flex column left dc__ellipsis-right">
                            <div className="cn-9 fs-14">{moment(startedOn).format(Moment12HourFormat)}</div>
                            <div className="flex left cn-7 fs-12">
                                {isCDType && (
                                    <>
                                        <div className="dc__capitalize">
                                            {['pre', 'post'].includes(stage?.toLowerCase()) ? `${stage}-deploy` : stage}
                                        </div>
                                        <span className="dc__bullet dc__bullet--d2 ml-4 mr-4"></span>

                                        {artifact && (
                                            <div className="dc__app-commit__hash dc__app-commit__hash--no-bg">
                                                <Docker className="commit-hash__icon grayscale" />
                                                {artifact.split(':')[1].slice(-12)}
                                            </div>
                                        )}
                                        <span className="dc__bullet dc__bullet--d2 ml-4 mr-4"></span>
                                    </>
                                )}
                                <div className="cn-7 fs-12">
                                    {triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}
                                </div>
                            </div>
                        </div>
                    </div>
                </NavLink>
            </ConditionalWrap>
        )
    },
)

const SummaryTooltipCard = React.memo(
    ({
        status,
        startedOn,
        triggeredBy,
        triggeredByEmail,
        ciMaterials,
        gitTriggers,
    }: SummaryTooltipCardType): JSX.Element => {
        return (
            <div className="build-card-popup p-16 br-4 w-400 bcn-0 mxh-300 dc__overflow-scroll">
                <span className="fw-6 fs-16 mb-4" style={{ color: colorMap[status.toLowerCase()] }}>
                    {status.toLowerCase() === 'cancelled' ? 'Aborted' : status}
                </span>
                <div className="flex column left">
                    <div className="flex left fs-12 cn-7">
                        <div>{moment(startedOn).format(Moment12HourFormat)}</div>
                        <div className="dc__bullet ml-6 mr-6"></div>
                        <div>{triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}</div>
                    </div>
                    {ciMaterials?.map((ciMaterial) => {
                        const gitDetail: GitTriggers = gitTriggers[ciMaterial.id]
                        const sourceType = gitDetail?.CiConfigureSourceType
                            ? gitDetail.CiConfigureSourceType
                            : ciMaterial?.type
                        const sourceValue = gitDetail?.CiConfigureSourceValue
                            ? gitDetail.CiConfigureSourceValue
                            : ciMaterial?.value
                        const gitMaterialUrl = gitDetail?.GitRepoUrl ? gitDetail.GitRepoUrl : ciMaterial?.url
                        if (sourceType !== SourceTypeMap.WEBHOOK && !gitDetail) {
                            return null
                        }
                        return (
                            <div className="mt-22 ci-material-detail" key={ciMaterial.id}>
                                {sourceType == SourceTypeMap.WEBHOOK ? (
                                    <div className="flex left column">
                                        <CiPipelineSourceConfig
                                            sourceType={sourceType}
                                            sourceValue={sourceValue}
                                            showTooltip={false}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="dc__git-logo"> </div>
                                        <div className="flex left column">
                                            <a
                                                href={createGitCommitUrl(gitMaterialUrl, gitDetail.Commit)}
                                                target="_blank"
                                                rel="noopener noreferer"
                                                className="fs-12 fw-6 cn-9 pointer"
                                            >
                                                /{sourceValue}
                                            </a>
                                            <p className="fs-12 cn-7">{gitDetail?.Message}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    },
)

const ViewAllCardsTile = (): JSX.Element => {
    return (
        <div
            style={{
                display: 'flex',
                padding: '12px 16px',
                alignItems: 'center',
                gap: '16px',
                alignSelf: 'stretch',
                background: 'var(--n-0, #FFF)',
            }}
        >
            <button
                style={{
                    cursor: 'pointer',
                    padding: '0',
                    border: 'none',
                    background: 'none',
                    height: '16px',
                    width: '16px',
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M13.5 8H2.5M2.5 8L7 3.5M2.5 8L7 12.5"
                        stroke="#596168"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div
                style={{
                    flex: '1 0 0',
                }}
            >
                <p
                    style={{
                        color: 'var(--n-900, #000A14)',
                        fontFamily: 'Open Sans',
                        fontSize: '13px',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        lineHeight: '20px',
                        display: 'table-cell',
                        verticalAlign: 'middle',
                    }}
                >
                    View all items in history
                </p>
            </div>
        </div>
    )
}
