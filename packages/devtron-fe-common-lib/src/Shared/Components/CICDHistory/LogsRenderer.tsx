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

import { useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AnsiUp from 'ansi_up'
import DOMPurify from 'dompurify'
import { ANSI_UP_REGEX, ComponentSizeType } from '@Shared/constants'
import { escapeRegExp } from '@Shared/Helpers'
import { ReactComponent as ICExpandAll } from '@Icons/ic-expand-all.svg'
import { ReactComponent as ICCollapseAll } from '@Icons/ic-collapse-all.svg'
import { ReactComponent as ICArrow } from '@Icons/ic-caret-down.svg'
import {
    Progressing,
    Host,
    useInterval,
    DOCUMENTATION,
    ROUTES,
    SearchBar,
    useUrlFilters,
    Tooltip,
    useRegisterShortcut,
} from '../../../Common'
import LogStageAccordion from './LogStageAccordion'
import {
    EVENT_STREAM_EVENTS_MAP,
    LOGS_RETRY_COUNT,
    LOGS_STAGE_IDENTIFIER,
    LOGS_STAGE_STREAM_SEPARATOR,
    POD_STATUS,
} from './constants'
import {
    CreateMarkupPropsType,
    CreateMarkupReturnType,
    DeploymentHistoryBaseParamsType,
    HistoryComponentType,
    LogsRendererType,
    StageDetailType,
    StageInfoDTO,
    StageStatusType,
} from './types'
import { getLogSearchIndex } from './utils'
import { ReactComponent as Info } from '../../../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as HelpIcon } from '../../../Assets/Icon/ic-help.svg'
import { ReactComponent as OpenInNew } from '../../../Assets/Icon/ic-arrow-out.svg'
import './LogsRenderer.scss'

const renderLogsNotAvailable = (subtitle?: string): JSX.Element => (
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

const renderBlobNotConfigured = (): JSX.Element => (
    <>
        {renderLogsNotAvailable('Logs are available only at runtime.')}
        <div className="flexbox configure-blob-container pt-8 pr-12 pb-8 pl-12 bcv-1 br-4">
            <HelpIcon className="icon-dim-20 fcv-5" />
            <span className="fs-13 fw-4 mr-8 ml-8">Want to store logs to view later?</span>
            <a
                className="fs-13 fw-6 cb-5 dc__no-decor"
                href={DOCUMENTATION.BLOB_STORAGE}
                target="_blank"
                rel="noreferrer"
            >
                Configure blob storage
            </a>
            <OpenInNew className="icon-dim-20 ml-8" />
        </div>
    </>
)

const renderConfigurationError = (isBlobStorageConfigured: boolean): JSX.Element => (
    <div className="flexbox dc__content-center flex-grow-1 flex-align-center dc__height-inherit dark-background">
        {!isBlobStorageConfigured ? renderBlobNotConfigured() : renderLogsNotAvailable()}
    </div>
)

const useCIEventSource = (url: string, maxLength?: number): [string[], EventSource, boolean] => {
    const [dataVal, setDataVal] = useState([])
    let retryCount = LOGS_RETRY_COUNT
    const [logsNotAvailableError, setLogsNotAvailableError] = useState<boolean>(false)
    const [interval, setInterval] = useState(1000)
    const buffer = useRef([])
    const eventSourceRef = useRef<EventSource>(null)

    function populateData() {
        setDataVal((data) => [...data, ...buffer.current])
        buffer.current = []
    }

    useInterval(populateData, interval)

    function closeEventSource() {
        if (eventSourceRef.current && eventSourceRef.current.close) {
            eventSourceRef.current.close()
        }
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
        setDataVal([])
    }

    function handleStreamEnd() {
        retryCount = LOGS_RETRY_COUNT
        setDataVal((data) => [...data, ...buffer.current])
        buffer.current = []
        eventSourceRef.current.close()
        setInterval(null)
    }

    function getData() {
        buffer.current = []
        eventSourceRef.current = new EventSource(url, { withCredentials: true })
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.MESSAGE, handleMessage)
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.START_OF_STREAM, handleStreamStart)
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.END_OF_STREAM, handleStreamEnd)
        // eslint-disable-next-line no-use-before-define
        eventSourceRef.current.addEventListener(EVENT_STREAM_EVENTS_MAP.ERROR, handleError)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleError(error: any) {
        retryCount -= 1
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

    useEffect(() => {
        if (url) {
            getData()
        }
        return closeEventSource
    }, [url, maxLength])

    return [dataVal, eventSourceRef.current, logsNotAvailableError]
}

const LogsRenderer = ({ triggerDetails, isBlobStorageConfigured, parentType, fullScreenView }: LogsRendererType) => {
    const { pipelineId, envId, appId } = useParams<DeploymentHistoryBaseParamsType>()
    const logsURL =
        parentType === HistoryComponentType.CI
            ? `${Host}/${ROUTES.CI_CONFIG_GET}/${pipelineId}/workflow/${triggerDetails.id}/logs`
            : `${Host}/${ROUTES.CD_MATERIAL_GET}/workflow/logs/${appId}/${envId}/${pipelineId}/${triggerDetails.id}`
    const [streamDataList, eventSource, logsNotAvailable] = useCIEventSource(
        triggerDetails.podStatus && triggerDetails.podStatus !== POD_STATUS.PENDING && logsURL,
    )
    const [stageList, setStageList] = useState<StageDetailType[]>([])
    const [searchResults, setSearchResults] = useState<string[]>([])
    const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0)
    // State for logs list in case no stages are available
    const [logsList, setLogsList] = useState<string[]>([])
    const { searchKey, handleSearch } = useUrlFilters()

    const hasSearchResults = searchResults.length > 0

    const areAllStagesExpanded = useMemo(() => stageList.every((item) => item.isOpen), [stageList])
    const shortcutTippyText = areAllStagesExpanded ? 'Collapse all stages' : 'Expand all stages'

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    const areStagesAvailable =
        (window._env_.FEATURE_STEP_WISE_LOGS_ENABLE && streamDataList[0]?.startsWith(LOGS_STAGE_IDENTIFIER)) || false

    function createMarkup({
        log,
        currentIndex = -1,
        targetSearchKey = searchKey,
        searchMatchResults = null,
        searchIndex = '',
    }: CreateMarkupPropsType): CreateMarkupReturnType {
        let isSearchKeyPresent = false
        try {
            // eslint-disable-next-line no-param-reassign
            log = log.replace(/\[[.]*m/, (m) => `\x1B[${m}m`)

            // This piece of code, would highlight the search key in the logs
            // We will remove color through [0m and add background color of y6, till searchKey is present and then revert back to original color
            // While reverting if index is 0, would not add any escape code since it is the start of the log
            if (targetSearchKey && areStagesAvailable) {
                // Search is working on assumption that color codes are not nested for words.
                const logParts = log.split(ANSI_UP_REGEX)
                const availableEscapeCodes = log.match(ANSI_UP_REGEX) || []
                const searchRegex = new RegExp(`(${escapeRegExp(targetSearchKey)})`, 'ig')
                const parts = logParts.reduce((acc, part, index) => {
                    try {
                        // Question: Can we directly set it as true inside the replace function?
                        isSearchKeyPresent = isSearchKeyPresent || searchRegex.test(part)
                        acc.push(
                            part.replace(searchRegex, (match) => {
                                if (searchIndex) {
                                    searchMatchResults?.push(searchIndex)
                                }
                                return `\x1B[0m\x1B[48;2;${searchMatchResults && currentIndex === searchMatchResults.length - 1 ? '0;102;204' : '197;141;54'}m${match}\x1B[0m${index > 0 ? availableEscapeCodes[index - 1] : ''}`
                            }),
                        )
                    } catch {
                        acc.push(part)
                    }

                    if (index < logParts.length - 1) {
                        acc.push(availableEscapeCodes[index])
                    }
                    return acc
                }, [])
                // eslint-disable-next-line no-param-reassign
                log = parts.join('')
            }
            const ansiUp = new AnsiUp()
            return {
                __html: ansiUp.ansi_to_html(log),
                isSearchKeyPresent,
            }
        } catch {
            return { __html: log, isSearchKeyPresent }
        }
    }

    /**
     *
     * @param status - status of the stage
     * @param lastUserActionState - If true, user had opened the stage else closed the stage
     * @param isSearchKeyPresent - If search key is present in the logs of that stage
     * @param isFromSearchAction - If the action is from search action
     * @returns
     */
    const getIsStageOpen = (
        status: StageStatusType,
        lastUserActionState: boolean | undefined,
        isSearchKeyPresent: boolean,
        isFromSearchAction: boolean,
    ): boolean => {
        const isInitialState = stageList.length === 0
        const lastActionState = lastUserActionState ?? true

        // In case of search action, would open the stage if search key is present
        // If search key is not present would return the last action state, if no action taken would return true(that is stage is new or being loaded)
        if (isFromSearchAction) {
            return isSearchKeyPresent || lastActionState
        }

        if (isInitialState) {
            return status !== StageStatusType.SUCCESS || isSearchKeyPresent
        }

        return lastActionState
    }

    const areEventsProgressing =
        triggerDetails.podStatus === POD_STATUS.PENDING || !!(eventSource && eventSource.readyState <= 1)

    /**
     * If initially parsedLogs are empty, and initialStatus is Success then would set opened as false on each
     * If initialStatus is not success and initial parsedLogs are empty then would set opened as false on each except the last
     * In case data is already present we will just find user's last action else would open the stage
     */
    const getStageListFromStreamData = (currentIndex: number, targetSearchKey?: string): StageDetailType[] => {
        // Would be using this to get last user action on stage
        const previousStageMap: Readonly<Record<string, Readonly<Record<string, StageDetailType>>>> = stageList.reduce(
            (acc, stageDetails) => {
                if (!acc[stageDetails.stage]) {
                    acc[stageDetails.stage] = {}
                }
                acc[stageDetails.stage][stageDetails.startTime] = stageDetails
                return acc
            },
            {} as Record<string, Record<string, StageDetailType>>,
        )

        // Map of stage as key and value as object with key as start time and value as boolean depicting if search key is present or not
        const searchKeyStatusMap: Record<string, Record<string, boolean>> = {}

        const searchMatchResults = []

        const newStageList = streamDataList.reduce((acc, streamItem: string, index) => {
            if (streamItem.startsWith(LOGS_STAGE_IDENTIFIER)) {
                try {
                    const { stage, startTime, endTime, status }: StageInfoDTO = JSON.parse(
                        streamItem.split(LOGS_STAGE_STREAM_SEPARATOR)[1],
                    )
                    const existingStage = acc.find((item) => item.stage === stage && item.startTime === startTime)
                    const previousExistingStage = previousStageMap[stage]?.[startTime] ?? ({} as StageDetailType)

                    if (existingStage) {
                        // Would update the existing stage with new endTime
                        existingStage.endTime = endTime
                        existingStage.status = status
                        existingStage.isOpen = getIsStageOpen(
                            status,
                            previousExistingStage.isOpen,
                            !!searchKeyStatusMap[stage]?.[startTime],
                            !!targetSearchKey,
                        )
                    } else {
                        const derivedStatus: StageStatusType = areEventsProgressing
                            ? StageStatusType.PROGRESSING
                            : StageStatusType.FAILURE

                        acc.push({
                            stage: stage || `Untitled stage ${index + 1}`,
                            startTime: startTime || '',
                            endTime: endTime || '',
                            // Would be defining the state when we receive the end status, otherwise it is loading and would be open
                            isOpen: getIsStageOpen(
                                derivedStatus,
                                previousExistingStage.isOpen,
                                // Wont be present in case of start stage since no logs are present yet
                                !!searchKeyStatusMap[stage]?.[startTime],
                                !!targetSearchKey,
                            ),
                            status: derivedStatus,
                            logs: [],
                        })
                    }
                    return acc
                } catch {
                    // In case of error would not create
                    return acc
                }
            }

            // Ideally in case of parallel build should receive stage name with logs
            // NOTE: For now would always append log to last stage, can show a loader on stage tiles till processed
            if (acc.length > 0) {
                const lastStage = acc[acc.length - 1]

                const searchIndex = getLogSearchIndex({
                    stageIndex: acc.length - 1,
                    lineNumberInsideStage: lastStage.logs.length,
                })

                // In case targetSearchKey is not present createMarkup will internally fallback to searchKey
                const { __html, isSearchKeyPresent } = createMarkup({
                    log: streamItem,
                    currentIndex,
                    searchMatchResults,
                    targetSearchKey,
                    searchIndex,
                })

                lastStage.logs.push(__html)
                if (isSearchKeyPresent) {
                    lastStage.isOpen = getIsStageOpen(
                        lastStage.status,
                        previousStageMap[lastStage.stage]?.[lastStage.startTime]?.isOpen,
                        true,
                        !!targetSearchKey,
                    )

                    if (!searchKeyStatusMap[lastStage.stage]) {
                        searchKeyStatusMap[lastStage.stage] = {}
                    }

                    searchKeyStatusMap[lastStage.stage][lastStage.startTime] = true
                }
            }

            return acc
        }, [] as StageDetailType[])

        setSearchResults(searchMatchResults)

        return newStageList
    }

    useEffect(() => {
        if (!streamDataList?.length) {
            return
        }

        if (!areStagesAvailable) {
            const newLogs = streamDataList.map((logItem) => createMarkup({ log: logItem }).__html)
            setLogsList(newLogs)
            return
        }

        const newStageList = getStageListFromStreamData(currentSearchIndex)
        setStageList(newStageList)
        // NOTE: Not adding searchKey as dependency since on mount we would already have searchKey
        // And for other cases we would use handleSearchEnter
    }, [streamDataList, areEventsProgressing])

    const handleToggleOpenAllStages = useCallback(() => {
        setStageList((prev) =>
            prev.map((stage) => ({
                ...stage,
                isOpen: !areAllStagesExpanded,
            })),
        )
    }, [areAllStagesExpanded])

    useEffect(() => {
        registerShortcut({ callback: handleToggleOpenAllStages, keys: ['E'] })

        return () => {
            unregisterShortcut(['E'])
        }
    }, [handleToggleOpenAllStages])

    const handleCycleSearchResult = (type: 'prev' | 'next' | 'reset', searchText = searchKey) => {
        if (searchResults.length > 0 || type === 'reset') {
            let currentIndex = 0
            if (type === 'next') {
                currentIndex = (currentSearchIndex + 1) % searchResults.length
            } else if (type === 'prev') {
                currentIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1
            }
            setCurrentSearchIndex(currentIndex)
            setStageList(getStageListFromStreamData(currentIndex, searchText))
        }
    }

    const handleNextSearchResult = () => {
        handleCycleSearchResult('next')
    }

    const handlePrevSearchResult = () => {
        handleCycleSearchResult('prev')
    }

    const handleSearchEnter = (searchText: string) => {
        handleSearch(searchText)
        if (searchKey === searchText) {
            handleNextSearchResult()
        } else {
            handleCycleSearchResult('reset', searchText)
        }
    }

    const handleStageClose = (index: number) => {
        const newLogs = structuredClone(stageList)
        newLogs[index].isOpen = false
        setStageList(newLogs)
    }

    const handleStageOpen = (index: number) => {
        const newLogs = structuredClone(stageList)
        newLogs[index].isOpen = true
        setStageList(newLogs)
    }

    const renderLogs = () => {
        if (areStagesAvailable) {
            return (
                <div
                    className="flexbox-col pb-20 logs-renderer-container flex-grow-1"
                    data-testid="check-logs-detail"
                    style={{
                        backgroundColor: '#0C1021',
                    }}
                >
                    <div
                        className={`flexbox-col pb-7 dc__position-sticky dc__zi-2 ${fullScreenView ? 'dc__top-0' : 'dc__top-36'}`}
                        style={{
                            backgroundColor: '#0C1021',
                        }}
                    >
                        <div className="flexbox logs-renderer__search-bar logs-renderer__filters-border-bottom pl-12">
                            <SearchBar
                                noBackgroundAndBorder
                                containerClassName="w-100"
                                inputProps={{
                                    placeholder: 'Search logs',
                                }}
                                handleEnter={handleSearchEnter}
                                initialSearchText={searchKey}
                                size={ComponentSizeType.large}
                            />
                            {!!searchKey && (
                                <div className="flexbox px-10 py-6 dc__gap-8 dc__align-items-center">
                                    <span className="fs-13 fw-4 lh-20 cn-0">
                                        {hasSearchResults ? currentSearchIndex + 1 : 0}/{searchResults.length}
                                        &nbsp;results
                                    </span>
                                    <div className="flexbox dc__gap-4">
                                        <button
                                            type="button"
                                            className={`dc__unset-button-styles flex p-6 br-4 dc__bg-n0--opacity-0_2 ${!hasSearchResults ? 'dc__disabled' : ''}`}
                                            onClick={handlePrevSearchResult}
                                            data-testid="logs-previous-search-match"
                                            aria-label="Focus the previous search result match"
                                            disabled={!hasSearchResults}
                                        >
                                            <ICArrow className="scn-0 dc__flip-180 icon-dim-14 dc__no-shrink" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`dc__unset-button-styles flex p-6 br-4 dc__bg-n0--opacity-0_2 ${!hasSearchResults ? 'dc__disabled' : ''}`}
                                            onClick={handleNextSearchResult}
                                            data-testid="logs-next-search-match"
                                            aria-label="Focus the next search result match"
                                            disabled={!hasSearchResults}
                                        >
                                            <ICArrow className="scn-0 icon-dim-14 dc__no-shrink" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <Tooltip
                                shortcutKeyCombo={{
                                    text: shortcutTippyText,
                                    combo: ['E'] as const,
                                }}
                                className="dc__mxw-500"
                                placement="left"
                            >
                                <button
                                    type="button"
                                    className="dc__unset-button-styles px-10 flex dc__bg-n0--opacity-0_2"
                                    onClick={handleToggleOpenAllStages}
                                    aria-label={shortcutTippyText}
                                >
                                    {areAllStagesExpanded ? (
                                        <ICCollapseAll className="icon-dim-16 dc__no-shrink dc__transition--transform scn-0" />
                                    ) : (
                                        <ICExpandAll className="icon-dim-16 dc__no-shrink dc__transition--transform scn-0" />
                                    )}
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="flexbox-col px-12 dc__gap-4">
                        {stageList.map(({ stage, isOpen, logs, endTime, startTime, status }, index) => (
                            <LogStageAccordion
                                key={`${stage}-${startTime}-log-stage-accordion`}
                                stage={stage}
                                isOpen={isOpen}
                                logs={logs}
                                endTime={endTime}
                                startTime={startTime}
                                status={status}
                                handleStageClose={handleStageClose}
                                handleStageOpen={handleStageOpen}
                                stageIndex={index}
                                isLoading={index === stageList.length - 1 && areEventsProgressing}
                                fullScreenView={fullScreenView}
                                searchIndex={searchResults[currentSearchIndex]}
                            />
                        ))}
                    </div>
                </div>
            )
        }

        // Having a fallback for logs that already stored in blob storage
        return (
            <div className="logs__body dark-background flex-grow-1" data-testid="check-logs-detail">
                {logsList.map((log: string, index: number) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className="flex top left mb-10 lh-24" key={`logs-${index}`}>
                        <span className="cn-4 col-2 pr-10">{index + 1}</span>
                        {/* eslint-disable-next-line react/no-danger */}
                        <p
                            className="mono fs-14 mb-0-imp"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(log),
                            }}
                        />
                    </div>
                ))}

                {areEventsProgressing && (
                    <div className="flex left event-source-status">
                        <Progressing />
                    </div>
                )}
            </div>
        )
    }

    return triggerDetails.podStatus !== POD_STATUS.PENDING &&
        logsNotAvailable &&
        (!isBlobStorageConfigured || !triggerDetails.blobStorageEnabled)
        ? renderConfigurationError(isBlobStorageConfigured)
        : renderLogs()
}

export default LogsRenderer
