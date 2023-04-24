import React, { useEffect, useRef, useState } from 'react'
import { Progressing, Host } from '@devtron-labs/devtron-fe-common-lib'
import { useInterval } from '../../../common'
import { useParams } from 'react-router'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help.svg'
import { DOCUMENTATION, EVENT_STREAM_EVENTS_MAP, LOGS_RETRY_COUNT, POD_STATUS, Routes } from '../../../../config'
import { default as AnsiUp } from 'ansi_up'
import { HistoryComponentType, LogsRendererType } from './types'

export default function LogsRenderer({
    triggerDetails,
    isBlobStorageConfigured,
    parentType,
}: LogsRendererType): JSX.Element {
    const { pipelineId, envId, appId } = useParams<{ pipelineId: string; envId: string; appId: string }>()
    const logsURL =
        parentType === HistoryComponentType.CI
            ? `${Host}/${Routes.CI_CONFIG_GET}/${pipelineId}/workflow/${triggerDetails.id}/logs`
            : `${Host}/${Routes.CD_CONFIG}/workflow/logs/${appId}/${envId}/${pipelineId}/${triggerDetails.id}`
    const [logs, eventSource, logsNotAvailable] = useCIEventSource(
        triggerDetails.podStatus && triggerDetails.podStatus !== POD_STATUS.PENDING && logsURL,
    )
    function createMarkup(log: string): {
        __html: string
    } {
        try {
            log = log.replace(/\[[.]*m/, (m) => '\x1B[' + m + 'm')
            const ansi_up = new AnsiUp()
            return { __html: ansi_up.ansi_to_html(log) }
        } catch (err) {
            return { __html: log }
        }
    }

    return triggerDetails.podStatus !== POD_STATUS.PENDING &&
        logsNotAvailable &&
        (!isBlobStorageConfigured || !triggerDetails.blobStorageEnabled) ? (
        renderConfigurationError(isBlobStorageConfigured)
    ) : (
        <div className="logs__body" data-testid="check-logs-detail">
            {logs.map((log: string, index: number) => {
                return (
                    <div className="flex top left mb-10 lh-24" key={`logs-${index}`}>
                        <span className="cn-4 col-2 pr-10">{index + 1}</span>
                        <p className="mono fs-14 mb-0-imp" dangerouslySetInnerHTML={createMarkup(log)} />
                    </div>
                )
            })}
            {(triggerDetails.podStatus === POD_STATUS.PENDING || (eventSource && eventSource.readyState <= 1)) && (
                <div className="flex left event-source-status">
                    <Progressing />
                </div>
            )}
        </div>
    )
}

function useCIEventSource(url: string, maxLength?: number) {
    const [data, setData] = useState([])
    let retryCount = LOGS_RETRY_COUNT
    const [logsNotAvailableError, setLogsNotAvailableError] = useState<boolean>(false)
    const [interval, setInterval] = useState(1000)
    const buffer = useRef([])
    const eventSourceRef = useRef(null)
    useInterval(populateData, interval)

    function populateData() {
        setData((data) => [...data, ...buffer.current])
        buffer.current = []
    }
    function closeEventSource() {
        if (eventSourceRef.current && eventSourceRef.current.close) eventSourceRef.current.close()
    }

    function handleMessage(event) {
        if (event.type === 'message') {
            retryCount = LOGS_RETRY_COUNT
            buffer.current.push(event.data)
        }
    }

    function handleStreamStart() {
        retryCount = LOGS_RETRY_COUNT
        buffer.current = []
        setData([])
    }

    function handleStreamEnd() {
        retryCount = LOGS_RETRY_COUNT
        setData((data) => [...data, ...buffer.current])
        buffer.current = []
        eventSourceRef.current.close()
        setInterval(null)
    }

    function handleError(error: any) {
        retryCount--
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }
        if (retryCount > 0) {
            getData()
        } else {
            setLogsNotAvailableError(true)
            setInterval(null)
        }
    }

    function getData() {
        buffer.current = []
        eventSourceRef.current = new EventSource(url, { withCredentials: true })
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.MESSAGE, handleMessage)
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.START_OF_STREAM, handleStreamStart)
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.END_OF_STREAM, handleStreamEnd)
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.ERROR, handleError)
    }

    useEffect(() => {
        if (url) {
            getData()
        }
        return closeEventSource
    }, [url, maxLength])

    return [data, eventSourceRef.current, logsNotAvailableError]
}

const renderLogsNotAvailable = (subtitle?: string): JSX.Element => {
    return (
        <div className="flexbox dc__content-center flex-align-center dc__height-inherit">
            <div>
                <div className="text-center">
                    <Info className="icon-dim-20" />
                </div>
                <div className="text-center cn-0 fs-14 fw-6">Logs not available</div>
                <div className="text-center cn-0 fs-13 fw-4">
                    {subtitle || 'Blob storage was not configured at pipeline run.'}
                </div>
            </div>
        </div>
    )
}

const renderBlobNotConfigured = (): JSX.Element => {
    return (
        <>
            {renderLogsNotAvailable('Logs are available only at runtime.')}
            <div className="flexbox configure-blob-container pt-8 pr-12 pb-8 pl-12 bcv-1 br-4">
                <Question className="icon-dim-20 fcv-5" />
                <span className="fs-13 fw-4 mr-8 ml-8">Want to store logs to view later?</span>
                <a className="fs-13 fw-6 cb-5 dc__no-decor" href={DOCUMENTATION.BLOB_STORAGE} target="_blank">
                    Configure blob storage
                </a>
                <OpenInNew className="icon-dim-20 ml-8" />
            </div>
        </>
    )
}

const renderConfigurationError = (isBlobStorageConfigured: boolean): JSX.Element => {
    return (
        <div className="flexbox dc__content-center flex-align-center dc__height-inherit">
            {!isBlobStorageConfigured ? renderBlobNotConfigured() : renderLogsNotAvailable()}
        </div>
    )
}
