import React, { useState, useEffect } from 'react'
import { getClusterNote, patchClusterNote } from './clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { Progressing, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterAboutPropType, MDEditorSelectedTabType } from './types'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import {
    MD_EDITOR_TAB,
    defaultClusterNote,
} from './constants'
import './clusterNodes.scss'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'
import ClusterDescription from '../common/Description/GenericDescription'

export default function ClusterAbout({ clusterId, isSuperAdmin }: ClusterAboutPropType) {
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [clusterAboutLoader, setClusterAboutLoader] = useState(false)
    const [descriptionId,setDescriptionId] = useState<number>(0)
    const [descriptionText, setDescriptionText] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedOn, setDescriptionUpdatedOn] = useState<string>('')
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>('')
    const [clusterCreatedOn, setClusterCreatedOn] = useState<string>('')
    const [clusterCreatedBy, setClusterCreatedBy] = useState<string>('')
    const [clusterDetailsName, setClusterDetailsName] = useState<string>('')

    const getClusterAbout = (): void => {
        setClusterAboutLoader(true)
        setErrorResponseCode(null)
        getClusterNote(clusterId)
            .then((response) => {
                if (response.result) {
                    let _moment: moment.Moment
                    let _date: string
                    if (response.result.clusterNote) {
                        setDescriptionText(response.result.clusterNote.description)
                        setDescriptionId(response.result.clusterNote.id)
                        setModifiedDescriptionText(response.result.clusterNote.description)
                        setDescriptionUpdatedBy(response.result.clusterNote.updatedBy)
                        _moment = moment(response.result.clusterNote.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                        _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.clusterNote.updatedOn
                        setDescriptionUpdatedOn(_date)
                    } else {
                        setDescriptionText(defaultClusterNote)
                        setDescriptionId(0)
                        setModifiedDescriptionText(defaultClusterNote)
                        setDescriptionUpdatedBy('')
                        setDescriptionUpdatedOn('')
                    }
                    _moment = moment(response.result.clusterCreatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.clusterCreatedOn
                    setClusterCreatedOn(_date)
                    setClusterCreatedBy(response.result.clusterCreatedBy)
                    setClusterDetailsName(response.result.clusterName)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                setErrorResponseCode(error.code)
                setClusterAboutLoader(false)
            })
    }

    useEffect(() => {
        getClusterAbout()
    }, [clusterId])

    if (errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }
    return (
        <div className="flexbox dc__overflow-hidden h-100">
            <div className="cluster-column-container w-250 bcn-0 dc__border-right">
                <div className="pr-16 pt-16 pl-16 pb-16">
                    <div className="icon-dim-48 flex br-4 cb-5 bcb-1 scb-5">
                        <ClusterIcon className="flex cluster-icon icon-dim-24" />
                    </div>
                    <div className="fs-14 lh-20 pt-12 fw-6 cn-9 show-shimmer-loading">
                        <div
                            data-testid={!clusterDetailsName ? 'cluster-name-loading' : 'cluster-name'}
                            className={!clusterDetailsName ? 'child-shimmer-loading' : 'dc__break-word'}
                        >
                            {clusterDetailsName}
                        </div>
                    </div>
                </div>
                <hr className="mt-0 mb-0" />
                <div className="pr-16 pt-16 pl-16 show-shimmer-loading">
                    <div className="fs-12 fw-4 lh-20 cn-7">Added by</div>
                    <div
                        data-testid="cluster-created-by"
                        className={
                            !clusterCreatedBy
                                ? 'child-shimmer-loading fs-13 fw-4 lh-20 cn-9 mt-2'
                                : 'fs-13 fw-4 lh-20 cn-9 mt-2'
                        }
                    >
                        {clusterCreatedBy}
                    </div>
                    <div className="fs-12 fw-4 lh-20 cn-7 mt-16">Added on</div>
                    <div
                        data-testid="cluster-created-on"
                        className={!clusterCreatedOn ? 'child-shimmer-loading' : 'fs-13 fw-4 lh-20 cn-9 mt-2'}
                    >
                        {clusterCreatedOn}
                    </div>
                </div>
            </div>
            {clusterAboutLoader ? (
                <Progressing pageLoader />
            ) : (
                <ClusterDescription
                    isClusterTerminal={true}
                    clusterId={clusterId}
                    isSuperAdmin={isSuperAdmin}
                    descriptionId={descriptionId}
                    initialDescriptionText={descriptionText}
                    initialDescriptionUpdatedBy={descriptionUpdatedBy}
                    initialDescriptionUpdatedOn={descriptionUpdatedOn}
                    initialEditDescriptionView={true}
                />
            )}
        </div>
    )
}
