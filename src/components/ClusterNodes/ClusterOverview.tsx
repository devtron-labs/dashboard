import React, { useEffect, useState } from 'react'
import { ERROR_TYPE } from "./types";
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { getClusterNote } from './clusterNodes.service';
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import GenericDescription from '../common/Description/GenericDescription';
import { defaultClusterNote } from './constants';
import moment from 'moment';
import { Moment12HourFormat } from '../../config';
import { ErrorScreenManager, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib';
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../ResourceBrowser/Constants';
import { unauthorizedInfoText } from '../ResourceBrowser/ResourceList/ClusterSelector';

interface DescriptionDataType {
    descriptionId: number,
    descriptionText: string,
    descriptionUpdatedBy: string,
    descriptionUpdatedOn: string
}


export default function ClusterOverview({ isSuperAdmin, clusterCapacityData, clusterErrorList, clusterErrorTitle, errorStatusCode }) {
    const { clusterId, namespace } = useParams<{
        clusterId: string
        namespace: string
    }>()
    const [descriptionData, setDiscriptionData] = useState<DescriptionDataType>({
        descriptionId: 0,
        descriptionText: defaultClusterNote,
        descriptionUpdatedBy: defaultClusterNote,
        descriptionUpdatedOn: ''
    })
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()
    const { path } = useRouteMatch();

    useEffect(() => {
        setIsLoading(true)
        if(errorStatusCode > 0) return
        getClusterNote(clusterId).then((response) => {
            if (response.result) {
                const _clusterNote = response.result.clusterNote
                let _moment: moment.Moment
                let _date: string
                const data: DescriptionDataType = {
                    descriptionText: defaultClusterNote,
                    descriptionId: 0,
                    descriptionUpdatedBy: '',
                    descriptionUpdatedOn: ''
                }
                if (_clusterNote) {
                    data.descriptionText = _clusterNote.description
                    data.descriptionId = _clusterNote.id
                    data.descriptionUpdatedBy = _clusterNote.updatedBy
                    _moment = moment(_clusterNote.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : _clusterNote.updatedOn
                    data.descriptionUpdatedOn = _date
                }
                setDiscriptionData(data)
            }
        }).catch((err) => {
            showError(err)
        }).finally(() => {
            setIsLoading(false)
        })
    }, [])

    const setCustomFilter = (errorType: ERROR_TYPE, filterText: string): void => {
        if (errorType === ERROR_TYPE.VERSION_ERROR) {
            const newUrl = generatePath(path, { clusterId, namespace, nodeType: SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase(), group: K8S_EMPTY_GROUP }) + '?' + `k8sversion=${filterText}`
            history.push(newUrl)
        }
    }

    const renderClusterError = (): JSX.Element => {
        if (clusterErrorList.length === 0) return
        return <div className="m-16 dc__border br-4 pt-12 pb-12">
            <div
                className="flexbox pointer mb-12 pl-16 pr-16"
            >
                <Error className="mt-2 mb-2 mr-8 icon-dim-20" />
                <span className="fw-6 fs-13 cn-9 mr-16">
                    {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors in cluster'}
                </span>
            </div>
            <div className="fw-6 pt-6 pb-6 pl-16 pr-16 flex left dc__border-bottom">
                <div className="w-250">Error</div>
                <span>Message</span>
            </div>
            <div className="pl-16 pr-16 pt-8">
                {clusterErrorList.map((error, index) => (
                    <div className="flex left">
                        <div className='w-250'>{error.errorType === ERROR_TYPE.OTHER ? 'Memory pressure' : `${clusterErrorTitle}`}</div>
                        <div key={`error-${index}`} className="fw-4 fs-13 cn-9">
                            {error.errorText}
                            {error.errorType === ERROR_TYPE.OTHER ? (
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
    }

    const renderCardDetails = () => {
        return <div className="flexbox dc__content-space pb-16">
            <div className="flexbox dc__content-space mr-16 w-50 p-16 bcn-0 br-4 en-2 bw-1">
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">CPU Usage</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.cpu?.usagePercentage}
                    </div>
                </div>
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                </div>
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">CPU Requests</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.cpu?.requestPercentage}
                    </div>
                </div>
                <div className="w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">CPU Limits</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.cpu?.limitPercentage}
                    </div>
                </div>
            </div>

            <div className="flexbox dc__content-space w-50 p-16 bcn-0 br-4 en-2 bw-1">
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">Memory Usage</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.memory?.usagePercentage}
                    </div>
                </div>
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.memory?.capacity}
                    </div>
                </div>
                <div className="mr-16 w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">Memory Requests</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.memory?.requestPercentage}
                    </div>
                </div>
                <div className="w-25">
                    <div className="dc__align-center fs-13 fw-4 cn-7">Memory Limits</div>
                    <div className="dc__align-center fs-24 fw-4 cn-9">
                        {clusterCapacityData?.memory?.limitPercentage}
                    </div>
                </div>
            </div>
        </div>
    }

    const renderState = () => {
        if (errorStatusCode) {
            return <ErrorScreenManager code={errorStatusCode} subtitle={unauthorizedInfoText()} />
        } else if (isLoading) {
            return <Progressing pageLoader />
        } else {
            return <>  {renderCardDetails()}
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
                /></>
        }
    }

    const renderClusterSummary = (): JSX.Element => {
        return (
            <div className={`dc__border-left resource-details-container dc__overflow-scroll p-16 ${errorStatusCode ? 'flex' : ''}`}>
                {renderState()}
            </div>
        )
    }


    return renderClusterSummary()
}