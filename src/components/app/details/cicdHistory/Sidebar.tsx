import React, { useEffect, useRef } from 'react'
import { ConditionalWrap, createGitCommitUrl, multiSelectStyles, useIntersection } from '../../../common'
import { useRouteMatch, useParams, useHistory, generatePath, useLocation } from 'react-router'
import { OptionType } from '../../types'
import ReactSelect from 'react-select'
import { Option, DropdownIndicator } from '../../../v2/common/ReactSelect.utils'
import { STAGE_TYPE } from '../triggerView/types'
import moment from 'moment'
import { Moment12HourFormat, SourceTypeMap } from '../../../../config'
import { CiPipelineSourceConfig } from '../../../ciPipeline/CiPipelineSourceConfig'
import { CiMaterial, GitTriggers, History } from './types'
import TippyHeadless from '@tippyjs/react/headless'
import { NavLink } from 'react-router-dom'
import { statusColor as colorMap } from '../../config'
import { ReactComponent as Docker } from '../../../../assets/icons/misc/docker.svg'
import ReactGA from 'react-ga4'
const Sidebar = React.memo(
    ({
        type,
        filterOptions,
        triggerHistory,
        hasMore,
        setPagination,
    }: {
        type: 'CI' | 'CD'
        filterOptions: OptionType[]
        triggerHistory: Map<number, History>
        hasMore: boolean
        setPagination: React.Dispatch<React.SetStateAction<{ offset: number; size: number }>>
    }) => {
        const { pipelineId, appId, envId } = useParams<{ appId: string; envId: string; pipelineId: string }>()
        const { push } = useHistory()
        const { path } = useRouteMatch()
        const handleFilterChange = (selectedFilter: OptionType): void => {
            if (type === 'CI') {
                push(generatePath(path, { appId, pipelineId: selectedFilter.value }))
            } else {
                push(generatePath(path, { envId: selectedFilter.value, appId }))
            }
        }
        function reloadNextAfterBottom() {
            ReactGA.event({
                category: 'pagination',
                action: 'scroll',
                label: type === STAGE_TYPE.CI ? 'ci-history' : 'cd-history',
                value: triggerHistory.size,
            })
            setPagination((pagination) => ({ offset: triggerHistory.size, size: 20 }))
        }
        const selectedFilter = filterOptions?.find(
            (filterOption) => filterOption.value === (type === STAGE_TYPE.CI ? pipelineId : envId),
        )
        return (
            <>
                <div className="select-pipeline-wrapper w-100 pl-16 pr-16" style={{ overflow: 'hidden' }}>
                    <label className="form__label">Select {type === STAGE_TYPE.CI ? 'Pipeline' : 'Environment'}</label>
                    <ReactSelect
                        value={selectedFilter}
                        options={filterOptions}
                        isSearchable={false}
                        onChange={handleFilterChange}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            control: (base) => ({
                                ...base,
                                minHeight: '36px',
                                fontWeight: '400',
                                backgroundColor: 'var(--N50)',
                                cursor: 'pointer',
                            }),
                            dropdownIndicator: (base) => ({
                                ...base,
                                padding: '0 8px',
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        menuPortalTarget={document.body}
                    />
                </div>
                <div className="flex column top left" style={{ overflowY: 'auto' }}>
                    {Array.from(triggerHistory)
                        .sort(([a], [b]) => b - a)
                        .map(([triggerId, triggerDetails]) => (
                            <HistorySummaryCard
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
                    {hasMore && <DetectBottom callback={reloadNextAfterBottom} />}
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
    }: {
        id: number
        status: string
        startedOn: string
        triggeredBy: number
        triggeredByEmail: string
        ciMaterials: CiMaterial[]
        gitTriggers: Map<number, GitTriggers>
        artifact: string
        type: 'CI' | 'CD'
        stage: 'POST' | 'DEPLOY' | 'PRE'
    }): JSX.Element => {
        const { path, url } = useRouteMatch()
        const { pathname } = useLocation()
        const currentTab = pathname.split('/').pop()
        const { triggerId, ...rest } = useParams<{ triggerId: string }>()

        const getPath = (): string => {
            if (type === STAGE_TYPE.CD) {
                return generatePath(path, { ...rest, triggerId: id }) + '/' + currentTab
            } else {
                return generatePath(path, { ...rest, buildId: id }) + '/' + currentTab
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
                <NavLink to={getPath} className="w-100 ci-details__build-card" activeClassName="active">
                    <div
                        className="w-100"
                        style={{
                            height: '64px',
                            display: 'grid',
                            gridTemplateColumns: '20px 1fr',
                            padding: '12px 0',
                            gridColumnGap: '12px',
                        }}
                    >
                        <div
                            className={`dc__app-summary__icon icon-dim-20 ${status
                                ?.toLocaleLowerCase()
                                .replace(/\s+/g, '')}`}
                        />
                        <div className="flex column left dc__ellipsis-right">
                            <div className="cn-9 fs-14">{moment(startedOn).format(Moment12HourFormat)}</div>
                            <div className="flex left cn-7 fs-12">
                                {type === STAGE_TYPE.CD && (
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
    }: {
        status: string
        startedOn: string
        triggeredBy: number
        triggeredByEmail: string
        ciMaterials: CiMaterial[]
        gitTriggers: Map<number, GitTriggers>
    }): JSX.Element => {
        return (
            <div
                className="build-card-popup p-16 br-4 flex column left"
                style={{ width: '400px', background: 'white' }}
            >
                <span className="fw-6 fs-16 mb-4" style={{ color: colorMap[status.toLowerCase()] }}>
                    {status.toLowerCase() === 'cancelled' ? 'Aborted' : status}
                </span>
                <div className="flex column left ">
                    <div className="flex left fs-12 cn-7">
                        <div>{moment(startedOn).format(Moment12HourFormat)}</div>
                        <div className="dc__bullet ml-6 mr-6"></div>
                        <div>{triggeredBy === 1 ? 'auto trigger' : triggeredByEmail}</div>
                    </div>
                    {ciMaterials?.map((ciMaterial) => {
                        const gitDetail: GitTriggers = gitTriggers[ciMaterial.id]
                        const sourceType = gitDetail?.CiConfigureSourceType
                            ? gitDetail?.CiConfigureSourceType
                            : ciMaterial?.type
                        const sourceValue = gitDetail?.CiConfigureSourceValue
                            ? gitDetail?.CiConfigureSourceValue
                            : ciMaterial?.value
                        const gitMaterialUrl = gitDetail?.GitRepoUrl ? gitDetail?.GitRepoUrl : ciMaterial?.url
                        return (
                            <div
                                className="mt-22"
                                key={ciMaterial.id}
                                style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gridColumnGap: '8px' }}
                            >
                                {sourceType != SourceTypeMap.WEBHOOK && gitDetail?.Commit && (
                                    <>
                                        <div className="dc__git-logo"> </div>
                                        <div className="flex left column">
                                            <a
                                                href={createGitCommitUrl(gitMaterialUrl, gitDetail?.Commit)}
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
                                {sourceType == SourceTypeMap.WEBHOOK && (
                                    <div className="flex left column">
                                        <CiPipelineSourceConfig
                                            sourceType={sourceType}
                                            sourceValue={sourceValue}
                                            showTooltip={false}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    },
)

const DetectBottom = ({ callback }): JSX.Element => {
    const target = useRef<HTMLSpanElement>(null)
    const intersected = useIntersection(target, {
        rootMargin: '0px',
        once: false,
    })

    useEffect(() => {
        if (intersected) {
            callback()
        }
    }, [intersected])

    return <span className="pb-5" ref={target}></span>
}
