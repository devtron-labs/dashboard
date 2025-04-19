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

import React, { useEffect, useState, useRef } from 'react'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import moment from 'moment'
import {
    ErrorScreenManager,
    getRandomColor,
    InfoIconTippy,
    EditableTextArea,
    ResourceKindType,
    getUrlWithSearchParams,
    showError,
    ClusterCapacityType,
    InstallationClusterConfigType,
    noop,
    StatusComponent,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    ClusterErrorType,
    ClusterOverviewProps,
    DescriptionDataType,
    ERROR_TYPE,
    ClusterDetailsType,
    ClusterDescriptionResponse,
    ClusterCapacityResponse,
} from './types'
import { getURLBasedOnSidebarGVK } from '@Components/ResourceBrowser/Utils'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { getClusterCapacity, getClusterDetails, updateClusterShortDescription } from './clusterNodes.service'
import GenericDescription from '../common/Description/GenericDescription'
import { CLUSTER_CONFIG_POLLING_INTERVAL, defaultClusterNote, defaultClusterShortDescription } from './constants'
import { Moment12HourFormat, URLS } from '../../config'
import {
    K8S_EMPTY_GROUP,
    SIDEBAR_KEYS,
    TARGET_K8S_VERSION_SEARCH_KEY,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../ResourceBrowser/Constants'
import { unauthorizedInfoText } from '../ResourceBrowser/ResourceList/ClusterSelector'
import { MAX_LENGTH_350 } from '../../config/constantMessaging'
import ConnectingToClusterState from '../ResourceBrowser/ResourceList/ConnectingToClusterState'
import { importComponentFromFELibrary } from '../common'
import { getUpgradeCompatibilityTippyConfig } from '@Components/ResourceBrowser/ResourceList/utils'
import { getAvailableCharts } from '@Services/service'

const Catalog = importComponentFromFELibrary('Catalog', null, 'function')
const ClusterConfig = importComponentFromFELibrary('ClusterConfig', null, 'function')
const ClusterAddOns = importComponentFromFELibrary('ClusterAddOns', null, 'function')
const MigrateClusterVersionInfoBar = importComponentFromFELibrary('MigrateClusterVersionInfoBar', null, 'function')
const getInstallationClusterConfig = importComponentFromFELibrary('getInstallationClusterConfig', null, 'function')

/* TODO: move into utils */
const metricsApiTippyContent = () => (
    <div className="dc__align-left dc__word-break dc__hyphens-auto fs-13 fw-4 lh-20 p-12">
        Devtron uses Kubernetes’s&nbsp;
        <a
            href="https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/#metrics-api"
            rel="noreferrer noopener"
            target="_blank"
        >
            Metrics API
        </a>
        &nbsp; to show CPU and Memory Capacity. Please install metrics-server in this cluster to display CPU and Memory
        Capacity.
    </div>
)

/* TODO: move into utils */
const tippyForMetricsApi = () => {
    return (
        <div className="flexbox dc__gap-6">
            <span>NA</span>
            <InfoIconTippy
                heading="Metrics API is not available"
                additionalContent={metricsApiTippyContent()}
                documentationLinkText="View metrics-server helm chart"
                documentationLink={`/dashboard${URLS.CHARTS_DISCOVER}?appStoreName=metrics-server`}
                iconClassName="icon-dim-20 ml-8 fcn-5"
            />
        </div>
    )
}

function ClusterOverview({ selectedCluster, addTab }: ClusterOverviewProps) {
    const { clusterId, namespace } = useParams<{
        clusterId: string
        namespace: string
    }>()
    const [errorMsg, setErrorMsg] = useState('')

    const [descriptionData, setDescriptionData] = useState<DescriptionDataType>({
        descriptionId: 0,
        descriptionText: defaultClusterNote,
        descriptionUpdatedBy: defaultClusterNote,
        descriptionUpdatedOn: '',
    })
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()
    const { path } = useRouteMatch()
    const [errorCode, setErrorCode] = useState(0)
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [clusterErrorList, setClusterErrorList] = useState<ClusterErrorType[]>([])
    const [clusterDetails, setClusterDetails] = useState<ClusterDetailsType>({} as ClusterDetailsType)
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [clusterConfig, setClusterConfig] = useState<InstallationClusterConfigType | null>(null)

    const requestAbortControllerRef = useRef(null)
    const clusterConfigPollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
    const getClusterConfigAbortControllerRef = useRef(new AbortController())

    const handleRetry = async () => {
        abortRequestAndResetError(true)
        await getClusterNoteAndCapacity(clusterId)
    }

    const handleUpdateClusterDescription = async (description: string): Promise<void> => {
        const requestPayload = {
            id: Number(clusterId),
            description,
        }
        try {
            const response = await updateClusterShortDescription(requestPayload)
            if (response.result) {
                setClusterDetails({
                    ...clusterDetails,
                    shortDescription: description,
                })
            }
        } catch (error) {
            showError(error)
            throw error
        }
    }

    const setClusterNoteDetails = (clusterNoteResponse: PromiseSettledResult<ClusterDescriptionResponse>) => {
        if (clusterNoteResponse.status === 'fulfilled') {
            let _moment: moment.Moment
            const _clusterNote = clusterNoteResponse.value.result.clusterNote
            const clusterDetails = {} as ClusterDetailsType
            clusterDetails.clusterName = clusterNoteResponse.value.result.clusterName
            clusterDetails.shortDescription =
                clusterNoteResponse.value.result.description || defaultClusterShortDescription
            clusterDetails.addedBy = clusterNoteResponse.value.result.clusterCreatedBy
            _moment = moment(clusterNoteResponse.value.result.clusterCreatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
            clusterDetails.addedOn = _moment.format(Moment12HourFormat)
            clusterDetails.serverURL = clusterNoteResponse.value.result.serverUrl
            setClusterDetails(clusterDetails)

            const data: DescriptionDataType = {
                descriptionText: defaultClusterNote,
                descriptionId: 0,
                descriptionUpdatedBy: '',
                descriptionUpdatedOn: '',
            }
            if (_clusterNote) {
                data.descriptionText = _clusterNote.description
                data.descriptionId = _clusterNote.id
                data.descriptionUpdatedBy = _clusterNote.updatedBy
                _moment = moment(_clusterNote.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                data.descriptionUpdatedOn = _moment.isValid()
                    ? _moment.format(Moment12HourFormat)
                    : _clusterNote.updatedOn
            }
            setDescriptionData(data)
        } else {
            setErrorCode(clusterNoteResponse.reason['code'])
        }
    }

    const fetchClusterConfig = async (clusterName: string) => {
        if (!getInstallationClusterConfig) {
            return
        }

        const config = await (getInstallationClusterConfig({ clusterName, abortControllerRef: getClusterConfigAbortControllerRef }) as Promise<InstallationClusterConfigType>)
        setClusterConfig(config)
    }

    const pollClusterConfig = (clusterName: string) => {
        if (clusterCapacityData?.name && clusterConfigPollTimeoutRef.current === null) {
            clusterConfigPollTimeoutRef.current = setTimeout(() => {
                fetchClusterConfig(clusterCapacityData.name)
                    .then(() => {
                        clusterConfigPollTimeoutRef.current = null
                        pollClusterConfig(clusterName)
                    })
                    .catch(noop)
            }, CLUSTER_CONFIG_POLLING_INTERVAL)
        }
    }

    const refreshImmediateAndStartPolling = (clusterName: string) => {
        fetchClusterConfig(clusterCapacityData.name).catch(noop)
        pollClusterConfig(clusterName)
    }

    const setClusterCapacityDetails = (clusterCapacityResponse: PromiseSettledResult<ClusterCapacityResponse>) => {
        if (clusterCapacityResponse.status === 'fulfilled') {
            const clusterCapacity = clusterCapacityResponse.value.result
            setClusterCapacityData(clusterCapacity)
            if (clusterCapacity?.name) {
                fetchClusterConfig(clusterCapacity.name).catch(noop)
            }
            const _errorList = []
            const _nodeErrors = Object.keys(clusterCapacityResponse.value.result.nodeErrors || {})
            const _nodeK8sVersions = clusterCapacityResponse.value.result.nodeK8sVersions || []
            if (_nodeK8sVersions.length > 1) {
                let diffType = ''
                let majorVersion
                let minorVersion
                for (const _nodeK8sVersion of _nodeK8sVersions) {
                    const elementArr = _nodeK8sVersion.split('.')
                    if (!majorVersion) {
                        majorVersion = elementArr[0]
                    }
                    if (!minorVersion) {
                        minorVersion = elementArr[1]
                    }
                    if (majorVersion !== elementArr[0]) {
                        diffType = 'Major'
                        break
                    } else if (diffType !== 'Minor' && minorVersion !== elementArr[1]) {
                        diffType = 'Minor'
                    }
                }
                if (diffType !== '') {
                    _errorList.push({
                        errorText: `${diffType} version diff identified among nodes. Current versions `,
                        errorType: ERROR_TYPE.VERSION_ERROR,
                        filterText: _nodeK8sVersions,
                    })
                }
            }

            if (_nodeErrors.length > 0) {
                for (const _nodeError of _nodeErrors) {
                    const _errorLength = clusterCapacityResponse.value.result.nodeErrors[_nodeError].length
                    _errorList.push({
                        errorText: `${_nodeError} on ${
                            _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                        }`,
                        errorType: _nodeError,
                        filterText: clusterCapacityResponse.value.result.nodeErrors[_nodeError],
                    })
                }
            }
            setClusterErrorList(_errorList)
        } else {
            setErrorCode(clusterCapacityResponse.reason['code'])
        }
    }
    const abortRequestAndResetError = (emptyPrev?: boolean) => {
        requestAbortControllerRef.current.abort()
        setErrorMsg('')
    }

    const getClusterNoteAndCapacity = async (clusterId: string): Promise<void> => {
        setErrorMsg('')
        setIsLoading(true)
        requestAbortControllerRef.current = new AbortController()
        const [clusterNoteResponse, clusterCapacityResponse] = await Promise.allSettled([
            getClusterDetails(clusterId, requestAbortControllerRef.current.signal),
            getClusterCapacity(clusterId, requestAbortControllerRef.current.signal),
        ])
        setClusterNoteDetails(clusterNoteResponse)
        setClusterCapacityDetails(clusterCapacityResponse)
        setIsLoading(false)
    }

    useEffect(() => {
        if (errorStatusCode > 0) {
            return
        }
        setErrorStatusCode(0)
        getClusterNoteAndCapacity(clusterId)
    }, [selectedCluster])

    useEffect(() => {
        return () => {
            requestAbortControllerRef.current?.abort()
            clearTimeout(clusterConfigPollTimeoutRef.current)
            getClusterConfigAbortControllerRef.current.abort()
        }
    }, [])

    const setCustomFilter = (errorType: ERROR_TYPE, filterText: string): void => {
        const queryParam = errorType === ERROR_TYPE.VERSION_ERROR ? 'k8sversion' : 'name'
        const newUrl =
            `${generatePath(path, {
                clusterId,
                namespace,
                nodeType: SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase(),
                group: K8S_EMPTY_GROUP,
            })}?` + `${queryParam}=${encodeURIComponent(filterText)}`
        history.push(newUrl)
    }

    const renderClusterError = (): JSX.Element => {
        if (clusterErrorList.length === 0) {
            return
        }
        return (
            <div className="mb-16 dc__border br-4 pt-12 bg__primary">
                <div className="flexbox pointer mb-12 pl-16 pr-16">
                    <Error className="mt-2 mb-2 mr-8 icon-dim-20" />
                    <span className="fw-6 fs-13 cn-9 mr-16">
                        {clusterErrorList.length === 1 ? '1 Error' : `${clusterErrorList.length} Errors in cluster`}
                    </span>
                </div>
                <div className="fw-6 pt-6 pb-6 pl-16 pr-16 flex left dc__border-bottom cn-7">
                    <div className="w-250">ERROR</div>
                    <span>MESSAGE</span>
                </div>
                <div className="pl-16 pr-16 fs-13 fw-4">
                    {clusterErrorList.map((error, index) => (
                        <div className="flex left pt-8 pb-8" key={`${error.errorType}-${index}`}>
                            <div className="w-250 cn-9">{error.errorType}</div>
                            <div className="fw-4 fs-13 cn-9">
                                {error.errorText}
                                {error.errorType !== ERROR_TYPE.VERSION_ERROR ? (
                                    <span
                                        className="cb-5 pointer"
                                        onClick={(event) => {
                                            setCustomFilter(error.errorType, error.filterText.join(','))
                                        }}
                                    >
                                        &nbsp; View nodes
                                    </span>
                                ) : (
                                    error.filterText.map((filter, index) => (
                                        <>
                                            &nbsp;
                                            {index > 0 && ', '}
                                            <span
                                                className="cb-5 pointer"
                                                onClick={(event) => {
                                                    setCustomFilter(error.errorType, filter)
                                                }}
                                            >
                                                {filter}
                                            </span>
                                        </>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderCardDetails = () => {
        return (
            <>
                {/* Commented to be used in future */}
                {/* {cardDetailsInBar()} */}
                <div className="dc__grid-cols-2 dc__gap-16 pb-16">
                    <div className="flexbox dc__gap-12 dc__content-space dc__overflow-auto bg__primary br-4 en-2 bw-1 pt-16 pl-16 pb-16 pr-16">
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">CPU Usage</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage
                                    ? clusterCapacityData?.cpu?.usagePercentage
                                    : tippyForMetricsApi()}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">CPU Capacity</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">CPU Requests</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">CPU Limits</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox dc__gap-12 dc__content-space dc__overflow-auto bg__primary br-4 en-2 bw-1 pt-16 pl-16 pb-16 pr-16">
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">Memory Usage</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage
                                    ? clusterCapacityData?.memory?.usagePercentage
                                    : tippyForMetricsApi()}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">Memory Capacity</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.capacity}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">Memory Requests</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7 dc__ellipsis-right">Memory Limits</div>
                            <div className="dc__align-left fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const handleOpenScanClusterTab = (selectedVersion: string) => {
        const upgradeClusterLowerCaseKind = SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase()

        const URL = getUrlWithSearchParams(
            getURLBasedOnSidebarGVK(SIDEBAR_KEYS.upgradeClusterGVK.Kind, clusterId, namespace),
            { [TARGET_K8S_VERSION_SEARCH_KEY]: selectedVersion },
        )

        addTab({
            idPrefix: UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
            kind: upgradeClusterLowerCaseKind,
            name: UPGRADE_CLUSTER_CONSTANTS.NAME,
            url: URL,
            dynamicTitle: `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${selectedVersion}`,
            tippyConfig: getUpgradeCompatibilityTippyConfig({
                targetK8sVersion: selectedVersion
            }),
        }).then(() => history.push(URL))
    }

    const creationPrefix = clusterConfig ? 'Created' : 'Added'

    const renderSideInfoData = () => {
        return (
            <aside className="flexbox-col dc__gap-16 w-300 dc__no-shrink">
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <Icon name='ic-bg-cluster' size={48} color={null} />
                    </div>
                    <div className="fs-16 fw-7 lh-24 cn-9 font-merriweather" data-testid="clusterOveviewName">
                        {clusterDetails?.clusterName}
                    </div>
                    <EditableTextArea
                        emptyState={defaultClusterShortDescription}
                        placeholder={defaultClusterShortDescription}
                        updateContent={handleUpdateClusterDescription}
                        initialText={clusterDetails.shortDescription}
                        validations={{
                            maxLength: {
                                value: 350,
                                message: MAX_LENGTH_350,
                            },
                        }}
                    />
                </div>
                <div className="dc__border-top-n1" />
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Status</div>
                        <div className="fs-13 fw-6">
                            <StatusComponent status={clusterCapacityData.status} iconSize={20}  />
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">{creationPrefix} on</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right">{clusterDetails.addedOn}</div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">{creationPrefix} by</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right flexbox">
                            {clusterDetails.addedBy && (
                                <>
                                    <div
                                        className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase mr-8 cn-0 fw-4"
                                        style={{ backgroundColor: getRandomColor(clusterDetails.addedBy) }}
                                    >
                                        {clusterDetails.addedBy[0]}
                                    </div>
                                    <div>{clusterDetails.addedBy}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dc__border-top-n1" />

                <div className="flexbox-col dc__gap-12">
                    <div className="flexbox-col dc__gap-4">
                        <span className="fs-13 fw-4 lh-20 cn-7">Kubernetes version</span>
                        <span className="cn-9 fs-13 fw-6 lh-20 dc__truncate">
                            {clusterCapacityData?.serverVersion || '-'}
                        </span>
                    </div>

                    {MigrateClusterVersionInfoBar && (
                        <MigrateClusterVersionInfoBar
                            handleOpenScanClusterTab={handleOpenScanClusterTab}
                            clusterName={clusterDetails?.clusterName}
                            currentVersion={clusterCapacityData?.serverVersion}
                        />
                    )}
                </div>
            </aside>
        )
    }

    const renderState = () => {
        if (errorStatusCode || errorCode) {
            return (
                <ErrorScreenManager
                    code={errorStatusCode || errorCode}
                    subtitle={errorCode == 403 ? unauthorizedInfoText(SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()) : ''}
                />
            )
        }

        if (isLoading || errorMsg) {
            return (
                <ConnectingToClusterState
                    loader={isLoading}
                    errorMsg={errorMsg}
                    selectedCluster={selectedCluster}
                    handleRetry={handleRetry}
                    requestAbortController={requestAbortControllerRef.current}
                />
            )
        }

        return (
            <div
                className="p-20 dc__column-gap-32 h-100 dc__overflow-auto flexbox flex-justify-center"
                style={{ backgroundImage: 'linear-gradient(249deg, var(--B100) 0%, var(--bg-primary) 50.58%)' }}
            >
                {renderSideInfoData()}
                <div className="dc__mxw-1068 flex-grow-1 mw-none">
                    {renderCardDetails()}
                    {ClusterConfig && clusterConfig && <ClusterConfig clusterConfig={clusterConfig} pollClusterConfig={refreshImmediateAndStartPolling} />}
                    {renderClusterError()}
                    {ClusterAddOns && <ClusterAddOns clusterId={clusterId} getAvailableCharts={getAvailableCharts} />}
                    {Catalog && <Catalog resourceId={clusterId} resourceType={ResourceKindType.cluster} />}
                    <GenericDescription
                        isClusterTerminal
                        clusterId={clusterId}
                        descriptionId={descriptionData.descriptionId}
                        initialDescriptionText={descriptionData.descriptionText}
                        initialDescriptionUpdatedBy={descriptionData.descriptionUpdatedBy}
                        initialDescriptionUpdatedOn={descriptionData.descriptionUpdatedOn}
                        initialEditDescriptionView
                    />
                </div>
            </div>
        )
    }

    return renderState()
}

export default React.memo(ClusterOverview)
