import React, { useEffect, useRef, useState } from 'react'
import { not, Progressing, useInterval, useKeyDown } from '../../../common'
import { useLocation, useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import { ReactComponent as ZoomIn } from '../../../../assets/icons/ic-fullscreen.svg'
import { ReactComponent as ZoomOut } from '../../../../assets/icons/ic-exit-fullscreen.svg'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import { CiMaterial, GitTriggers, History } from '../cIDetails/types'
import { EVENT_STREAM_EVENTS_MAP, Host, LOGS_RETRY_COUNT, POD_STATUS, Routes } from '../../../../config'
import { default as AnsiUp } from 'ansi_up'
import { renderConfigurationError } from '../cdDetails/cd.utils'
import { STAGE_TYPE } from '../triggerView/types'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import EmptyState from '../../../EmptyState/EmptyState'
import { NavLink } from 'react-router-dom'

export const LogResizeButton = ({
    fullScreenView,
    setFullScreenView,
}: {
    fullScreenView: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element => {
    const { pathname } = useLocation()

    const keys = useKeyDown()

    useEffect(() => {
        if (!pathname.includes('/logs')) return
        switch (keys.join('')) {
            case 'f':
                setFullScreenView(not)
                break
            case 'Escape':
                setFullScreenView(false)
                break
        }
    }, [keys])

    const hideFullScreen = (): void => {
        setFullScreenView(false)
    }

    const showFullScreen = (): void => {
        setFullScreenView(true)
    }
    return pathname.includes('/logs') ? (
        <Tippy
            placement="top"
            arrow={false}
            className="default-tt"
            content={fullScreenView ? 'Exit fullscreen (f)' : 'Enter fullscreen (f)'}
        >
            {fullScreenView ? (
                <ZoomOut className="zoom zoom--out pointer" onClick={hideFullScreen} />
            ) : (
                <ZoomIn className="zoom zoom--in pointer" onClick={showFullScreen} />
            )}
        </Tippy>
    ) : null
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

export const LogsRenderer = ({
    triggerDetails,
    isBlobStorageConfigured,
    parentType,
}: {
    triggerDetails: History
    isBlobStorageConfigured: boolean
    parentType: string
}): JSX.Element => {
    const { pipelineId, envId, appId } = useParams<{ pipelineId: string; envId: string; appId: string }>()
    const [logs, eventSource, logsNotAvailable] = useCIEventSource(
        triggerDetails.podStatus && triggerDetails.podStatus !== POD_STATUS.PENDING && parentType === STAGE_TYPE.CI
            ? `${Host}/${Routes.CI_CONFIG_GET}/${pipelineId}/workflow/${triggerDetails.id}/logs`
            : `${Host}/${Routes.CD_CONFIG}/workflow/logs/${appId}/${envId}/${pipelineId}/${triggerDetails.id}`,
    )
    function createMarkup(log) {
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
        <div className="logs__body">
            {logs.map((log, index) => {
                return <p className="mono fs-14" key={`logs-${index}`} dangerouslySetInnerHTML={createMarkup(log)} />
            })}
            {(triggerDetails.podStatus === POD_STATUS.PENDING || (eventSource && eventSource.readyState <= 1)) && (
                <div className="flex left event-source-status">
                    <Progressing />
                </div>
            )}
        </div>
    )
}

export const Scroller = ({
    scrollToTop,
    scrollToBottom,
    style,
}: {
    scrollToTop: (e: any) => void
    scrollToBottom: (e: any) => void
    style: any
}): JSX.Element => {
    return (
        <div
            style={{ ...style, display: 'flex', flexDirection: 'column', justifyContent: 'top' }}
            className="dc__element-scroller"
        >
            <Tippy className="default-tt" arrow={false} content="Scroll to Top">
                <button className="flex" disabled={!scrollToTop} type="button" onClick={scrollToTop}>
                    <DropDownIcon className="rotate" style={{ ['--rotateBy' as any]: '180deg' }} />
                </button>
            </Tippy>
            <Tippy className="default-tt" arrow={false} content="Scroll to Bottom">
                <button className="flex" disabled={!scrollToBottom} type="button" onClick={scrollToBottom}>
                    <DropDownIcon className="rotate" />
                </button>
            </Tippy>
        </div>
    )
}

export const GitChanges = ({
    gitTriggers,
    ciMaterials,
}: {
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
}) => {
    return (
        <div className="flex column left w-100 p-16">
            {ciMaterials?.map((ciMaterial) => {
                const gitTrigger = gitTriggers[ciMaterial.id]
                return gitTrigger && (gitTrigger.Commit || gitTrigger.WebhookData?.Data) ? (
                    <div
                        key={gitTrigger?.Commit}
                        className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 mb-12"
                        style={{ width: 'min( 100%, 800px )' }}
                    >
                        <GitCommitInfoGeneric
                            materialUrl={gitTrigger?.GitRepoUrl ? gitTrigger?.GitRepoUrl : ciMaterial?.url}
                            showMaterialInfo={true}
                            commitInfo={gitTrigger}
                            materialSourceType={
                                gitTrigger?.CiConfigureSourceType ? gitTrigger?.CiConfigureSourceType : ciMaterial?.type
                            }
                            selectedCommitInfo={''}
                            materialSourceValue={
                                gitTrigger?.CiConfigureSourceValue
                                    ? gitTrigger?.CiConfigureSourceValue
                                    : ciMaterial?.value
                            }
                        />
                    </div>
                ) : null
            })}
        </div>
    )
}

export const EmptyView = ({
    title,
    subTitle,
    link,
    linkText,
}: {
    title: string
    subTitle: string
    link?: string
    linkText?: string
}) => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>{title}</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>{subTitle}</EmptyState.Subtitle>
            {link && (
                <EmptyState.Button>
                    <NavLink to={link} className="cta cta--ci-details" target="_blank">
                        <OpenInNew className="mr-5" />
                        {linkText}
                    </NavLink>
                </EmptyState.Button>
            )}
        </EmptyState>
    )
}
