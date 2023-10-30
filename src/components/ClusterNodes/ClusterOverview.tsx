import React, { useEffect, useState } from 'react'
import { ClusterErrorType, ClusterOverviewProps, DescriptionDataType, ERROR_TYPE, ClusterDetailsType } from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as TippyIcon } from '../../assets/icons/ic-help-outline.svg'
import { getClusterCapacity, getClusterDetails, updateClusterShortDescription } from './clusterNodes.service'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import GenericDescription from '../common/Description/GenericDescription'
import { defaultClusterNote, defaultClusterShortDescription } from './constants'
import moment from 'moment'
import { Moment12HourFormat,URLS } from '../../config'
import {
    ErrorScreenManager,
    TippyCustomized,
    TippyTheme,
    showError,
    getRandomColor,
    ClipboardButton,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../ResourceBrowser/Constants'
import { unauthorizedInfoText } from '../ResourceBrowser/ResourceList/ClusterSelector'
import { ReactComponent as ClusterOverviewIcon } from '../../assets/icons/cluster-overview.svg'
import { SOME_ERROR_MSG } from '../../config/constantMessaging'
import ConnectingToClusterState from '../ResourceBrowser/ResourceList/ConnectingToClusterState'
import { EditableTextArea } from '../common/EditableTextArea/EditableTextArea'


function ClusterOverview({
    isSuperAdmin,
    clusterCapacityData,
    setClusterErrorTitle,
    setSelectedResource,
    setClusterCapacityData,
    selectedCluster,
    setSelectedCluster,
    sideDataAbortController,
}: ClusterOverviewProps) {
    const { clusterId, namespace } = useParams<{
        clusterId: string
        namespace: string
    }>()
    const [triggerCopy, setTriggerCopy] = useState<boolean>(false)
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
            &nbsp; to show CPU and Memory Capacity. Please install metrics-server in this cluster to display CPU and
            Memory Capacity.
        </div>
    )

    const handleRetry = async () => {
        abortReqAndUpdateSideDataController(true)
        await getClusterNoteAndCapacity(clusterId)
    }

    const handleUpdateClusterDescription = async (description: string): Promise<void> => {
        const requestPayload = {
            id: Number(clusterId),
            description: description,
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
            if (error['code'] === 403) {
                setErrorCode(error['code'])
            } else {
                showError(error)
            }
            throw error
        }
    }

    const setClusterNoteDetails = (clusterNoteResponse) => {
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
                data.descriptionUpdatedOn = _moment.isValid() ? _moment.format(Moment12HourFormat) : _clusterNote.updatedOn
            }
            setDescriptionData(data)
        } else {
            if (clusterNoteResponse.reason['code'] === 403) {
                setErrorCode(clusterNoteResponse.reason['code'])
            } else showError(clusterNoteResponse.reason)
        }
    }

    const setClusterCapacityDetails = (clusterCapacityResponse) => {
        if (clusterCapacityResponse.status === 'fulfilled') {
            setClusterCapacityData(clusterCapacityResponse.value.result)
            let _errorTitle = '',
                _errorList = [],
                _nodeErrors = Object.keys(clusterCapacityResponse.value.result.nodeErrors || {})
            const _nodeK8sVersions = clusterCapacityResponse.value.result.nodeK8sVersions || []
            if (_nodeK8sVersions.length > 1) {
                let diffType = '',
                    majorVersion,
                    minorVersion
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
                    _errorTitle = 'Version diff'
                    _errorList.push({
                        errorText: `${diffType} version diff identified among nodes. Current versions `,
                        errorType: ERROR_TYPE.VERSION_ERROR,
                        filterText: _nodeK8sVersions,
                    })
                }
            }

            if (_nodeErrors.length > 0) {
                _errorTitle += (_errorTitle ? ', ' : '') + _nodeErrors.join(', ')
                for (const _nodeError of _nodeErrors) {
                    const _errorLength = clusterCapacityResponse.value.result.nodeErrors[_nodeError].length
                    _errorList.push({
                        errorText: `${_nodeError} on ${
                            _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                        }`,
                        errorType: _nodeError,
                        filterText: clusterCapacityResponse.value.result.nodeErrors[_nodeError],
                    })
                    setClusterErrorTitle(_errorTitle)
                    setClusterErrorList(_errorList)
                }
            }
        } else {
            if (clusterCapacityResponse.reason['code'] === 403) {
                setErrorCode(clusterCapacityResponse.reason['code'])
            } else {
                const error = clusterCapacityResponse.reason
                setErrorMsg(
                    (error instanceof ServerErrors && Array.isArray(error.errors)
                        ? error.errors[0]?.userMessage
                        : error['message']) ?? SOME_ERROR_MSG,
                )
            }
        }
    }
    const abortReqAndUpdateSideDataController = (emptyPrev?: boolean) => {
        if (emptyPrev) {
            sideDataAbortController.prev = null
        } else {
            sideDataAbortController.new.abort()
            sideDataAbortController.prev = sideDataAbortController.new
        }
        setErrorMsg('')
    }

    const getClusterNoteAndCapacity = async (clusterId: string): Promise<void> => {
        setErrorMsg('')
        setIsLoading(true)

        const [clusterNoteResponse, clusterCapacityResponse] = await Promise.allSettled([
            getClusterDetails(clusterId, sideDataAbortController.new.signal),
            getClusterCapacity(clusterId, sideDataAbortController.new.signal),
        ])
        setClusterNoteDetails(clusterNoteResponse)
        setClusterCapacityDetails(clusterCapacityResponse)
        setIsLoading(false)
    }

    useEffect(() => {
        if (errorStatusCode > 0) return
        setErrorStatusCode(0)
        getClusterNoteAndCapacity(clusterId)
    }, [selectedCluster])


    const setCustomFilter = (errorType: ERROR_TYPE, filterText: string): void => {
        const queryParam = errorType === ERROR_TYPE.VERSION_ERROR ? 'k8sversion' : 'name'
        const newUrl =
            generatePath(path, {
                clusterId,
                namespace,
                nodeType: SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase(),
                group: K8S_EMPTY_GROUP,
            }) + 
            '?' +
            `${queryParam}=${encodeURIComponent(filterText)}`
        history.push(newUrl)

        setSelectedResource({
            namespaced: false,
            gvk: SIDEBAR_KEYS.nodeGVK,
        })
    }
    
    const renderClusterError = (): JSX.Element => {
        if (clusterErrorList.length === 0) return
        return (
            <div className="mb-16 dc__border br-4 pt-12">
                <div className="flexbox pointer mb-12 pl-16 pr-16">
                    <Error className="mt-2 mb-2 mr-8 icon-dim-20" />
                    <span className="fw-6 fs-13 cn-9 mr-16">
                        {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors in cluster'}
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

    const tippyForMetricsApi = () => {
        return (
            <>
                <span>NA</span>
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300 h-100 fcv-5 dc__align-left"
                    placement="bottom"
                    Icon={QuestionFilled}
                    heading='Metrics API is not available'
                    showCloseButton={true}
                    trigger="click"
                    additionalContent={metricsApiTippyContent()}
                    interactive={true}
                    documentationLinkText="View metrics-server helm chart"
                    documentationLink={`/dashboard${URLS.CHARTS_DISCOVER}/?appStoreName=metrics-server`}
                >
                    <TippyIcon className="icon-dim-20 ml-8 cursor fcn-5" />
                </TippyCustomized>
            </>
        )
    }

    // const cardDetailsInBar = () => {
    //     /* Commented to be used in future*/

    //     const tempData = {
    //         totalNodes: 13,
    //         onDemand: { value: 9, color: '#ABCFF3' },
    //         fallback: { value: 0, color: '#FFB549' },
    //         spot: { value: 4, color: '#06C' },
    //     }
    //     const tempData2 = {
    //         totalPods: 140,
    //         scheduled: { value: 122, color: '#B94DC8' },
    //         unscheduled: { value: 18, color: '#D0D4D9' },
    //     }
    //     const onDemandPercentage = (tempData.onDemand.value / tempData.totalNodes) * 100
    //     const fallbackPercentage = (tempData.fallback.value / tempData.totalNodes) * 100
    //     const spotPercentage = (tempData.spot.value / tempData.totalNodes) * 100
    //     const scheduledPercentage = (tempData2.scheduled.value / tempData2.totalPods) * 100
    //     const unscheduledPercentage = (tempData2.unscheduled.value / tempData2.totalPods) * 100
    //     return (
    //         <div className="flexbox dc__column-gap-24">
    //             <div className="w-50 bcn-0 flexbox-col">
    //                 <div className="flexbox dc__column-gap-32">
    //                     <div>
    //                         <div className="dc__align-left fs-13 fw-4 cn-7">Total Nodes</div>
    //                         <div className="dc__align-left fs-20 fw-6 cb-5">{tempData.totalNodes}</div>
    //                     </div>
    //                     <div>
    //                         <div className="flexbox  dc__align-items-center">
    //                             <div className="mw-4 h-12 bcb-2 mr-4 br-2"></div>
    //                             <div className="dc__align-left fs-13 fw-4 cn-7">On Demand</div>
    //                         </div>
    //                         <div className="dc__align-left fs-20 fw-4 cn-9">{tempData.onDemand.value}</div>
    //                     </div>
    //                     <div>
    //                         <div className="flexbox dc__align-items-center">
    //                             <div className="mw-4 h-12 bcy-5 mr-4 br-2"></div>
    //                             <div className="dc__align-left fs-13 fw-4 cn-7">Fallback</div>
    //                         </div>
    //                         <div className="dc__align-left fs-20 fw-4 cn-9">{tempData.fallback.value}</div>
    //                     </div>
    //                     <div>
    //                         <div className="flexbox dc__align-items-center">
    //                             <div className="mw-4 h-12 bcb-5 mr-4 br-2"></div>
    //                             <div className="dc__align-left fs-13 fw-4 cn-7">Spot</div>
    //                         </div>
    //                         <div className="dc__align-left fs-20 fw-4 cn-9">{tempData.spot.value}</div>
    //                     </div>
    //                 </div>
    //                 <div
    //                     className="h-8 br-4"
    //                     style={{
    //                         width: '100%',
    //                         backgroundImage: `linear-gradient(to right,${tempData.onDemand.color} ${onDemandPercentage}%, ${tempData.fallback.color} ${fallbackPercentage}%, ${tempData.spot.color} ${spotPercentage}%)`,
    //                     }}
    //                 ></div>
    //             </div>
    //             <div className="dc__content-space w-50 bcn-0 flexbox-col">
    //                 <div className="flexbox dc__column-gap-32">
    //                     <div>
    //                         <div className="dc__align-left fs-13 fw-4 cn-7">Total Pods</div>
    //                         <div className="dc__align-left fs-20 fw-6 cb-5">{tempData2.totalPods}</div>
    //                     </div>
    //                     <div>
    //                         <div className="flexbox dc__align-items-center">
    //                             <div className="mw-4 h-12 mr-4 br-2" style={{ backgroundColor: '#B94DC8' }}></div>
    //                             <div className="dc__align-left fs-13 fw-4 cn-7">Scheduled</div>
    //                         </div>
    //                         <div className="dc__align-left fs-20 fw-4 cn-9">{tempData2.scheduled.value}</div>
    //                     </div>
    //                     <div>
    //                         <div className="flexbox dc__align-items-center">
    //                             <div className="mw-4 h-12 bcn-2 mr-4 br-2"></div>
    //                             <div className="dc__align-left fs-13 fw-4 cn-7">Unscheduled</div>
    //                         </div>
    //                         <div className="dc__align-left fs-20 fw-4 cn-9">{tempData2.unscheduled.value}</div>
    //                     </div>
    //                 </div>
    //                 <div
    //                     className="h-8 br-4"
    //                     style={{
    //                         width: '100%',
    //                         backgroundImage: `linear-gradient(to right,${tempData2.scheduled.color} ${scheduledPercentage}%, ${tempData2.unscheduled.color} ${unscheduledPercentage}%)`,
    //                     }}
    //                 ></div>
    //             </div>
    //         </div>
    //     )
    // }

    const renderCardDetails = () => {
        return (
            <div className="flexbox dc__content-space p-20 dc__border br-4 mb-16 flexbox-col bcn-0">
                {/* Commented to be used in future*/}
                {/* {cardDetailsInBar()} */}
                <div className="flexbox dc__column-gap-24">
                    <div className="flexbox w-50 dc__column-gap-32">
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">CPU Usage</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage
                                    ? clusterCapacityData?.cpu?.usagePercentage
                                    : tippyForMetricsApi()}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">CPU Capacity</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">CPU Requests</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">CPU Limits</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox dc__column-gap-24 w-50 br-4">
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">Memory Usage</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage
                                    ? clusterCapacityData?.memory?.usagePercentage
                                    : tippyForMetricsApi()}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">Memory Capacity</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.memory?.capacity}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">Memory Requests</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div>
                            <div className="dc__align-left fs-13 fw-4 cn-7">Memory Limits</div>
                            <div className="dc__align-left fs-20 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    const renderSideInfoData=()=>{
        return (
            <aside className="flexbox-col dc__gap-16 w-300 dc__no-shrink">
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <ClusterOverviewIcon className="icon-dim-48" />
                    </div>
                    <div className="fs-16 fw-7 lh-24 cn-9" data-testid="clusterOveviewName">
                        {clusterDetails?.clusterName}
                    </div>
                    <EditableTextArea
                        placeholder="Enter short description"
                        rows={4}
                        updateContent={handleUpdateClusterDescription}
                        initialText={clusterDetails.shortDescription}
                    />
                </div>
                <div className="dc__border-top-n1" />
                <div className="flexbox-col dc__gap-12">
                    {/* Commented code since reponse is not coming from backend */}
                    {/* <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4" data-testid="overview-project">
                            Cluster Provider
                        </div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right">{clusterInfo.clusterProvider}</div>
                    </div> */}
                    {/* <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Region</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right">{clusterInfo.Region}</div>
                    </div> */}
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Server URL</div>
                        <div className="flexbox">
                            <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right mr-6">
                                {clusterDetails.serverURL}
                            </div>
                            <ClipboardButton
                                content={clusterDetails.serverURL}
                                copiedTippyText="Copied Server URL"
                                duration={1000}
                                trigger={triggerCopy}
                                setTrigger={setTriggerCopy}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Added on</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right">{clusterDetails.addedOn}</div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Added by</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right flexbox">
                            {clusterDetails.addedBy && (
                                <>
                                    <div
                                        className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase mr-8"
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
            </aside>
        )
    }

    const renderState = () => {
        if (errorStatusCode || errorCode) {
            return (
                <ErrorScreenManager
                    code={errorStatusCode || errorCode}
                    subtitle={unauthorizedInfoText(SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase())}
                />
            )
        } else if (isLoading || errorMsg) {
            return (
                <div className="flex flex-grow-1">
                    <ConnectingToClusterState
                        loader={isLoading}
                        errorMsg={errorMsg}
                        setErrorMsg={setErrorMsg}
                        selectedCluster={selectedCluster}
                        setSelectedCluster={setSelectedCluster}
                        handleRetry={handleRetry}
                        sideDataAbortController={sideDataAbortController}
                    />
                </div>
            )
        } else {
            return (
                <>
                    {renderSideInfoData()}
                    <div className="dc__overflow-scroll pr-20">
                        {renderCardDetails()}
                        {renderClusterError()}
                        <GenericDescription
                            isClusterTerminal={true}
                            clusterId={clusterId}
                            isSuperAdmin={isSuperAdmin}
                            descriptionId={descriptionData.descriptionId}
                            initialDescriptionText={descriptionData.descriptionText}
                            initialDescriptionUpdatedBy={descriptionData.descriptionUpdatedBy}
                            initialDescriptionUpdatedOn={descriptionData.descriptionUpdatedOn}
                            initialEditDescriptionView={true}
                        />
                    </div>
                </>
            )
        }
    }

    const renderClusterSummary = (): JSX.Element => {
        return (
            <div
                className={`dc__border-left resource-details-container flexbox bcn-0 pl-20 pt-20 dc__column-gap-32 ${
                    errorStatusCode || errorCode ? 'flex' : ''
                }`}
                style={{backgroundImage:'linear-gradient(249deg, #D4E6F7 0%,  var(--N50)50.58%)'}}
            >
                {renderState()}
            </div>
        )
    }

    return renderClusterSummary()
}

export default React.memo(ClusterOverview)
