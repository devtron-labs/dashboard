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

import { useEffect, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import { useLocation, useParams, useRouteMatch } from 'react-router-dom'
import Select from 'react-select'
import Tippy from '@tippyjs/react'

import {
    AppThemeType,
    Checkbox,
    CHECKBOX_VALUE,
    getComponentSpecificThemeClass,
    Host,
    noop,
    Progressing,
    SearchBar,
    ToastManager,
    ToastVariantType,
    useDownload,
    useKeyDown,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Abort } from '@Icons/ic-abort.svg'
import { ReactComponent as Download } from '@Icons/ic-arrow-line-down.svg'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'
import { ReactComponent as LinesIcon } from '@Icons/ic-lines.svg'
import { ReactComponent as PlayButton } from '@Icons/ic-play-filled.svg'
import { ReactComponent as StopButton } from '@Icons/ic-stop-filled.svg'

import { CUSTOM_LOGS_FILTER } from '../../../../../../config'
import { Subject } from '../../../../../../util/Subject'
import { replaceLastOddBackslash } from '../../../../../../util/Util'
import sseWorker from '../../../../../app/grepSSEworker'
import WebWorker from '../../../../../app/WebWorker'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { Option } from '../../../../common/ReactSelect.utils'
import { multiSelectStyles, podsDropdownStyles } from '../../../../common/ReactSelectCustomization'
import { AppDetailsTabs } from '../../../appDetails.store'
import { LogsComponentProps, Options } from '../../../appDetails.type'
import IndexStore from '../../../index.store'
import { downloadLogs, getLogsURL } from '../nodeDetail.api'
import { NodeDetailTab } from '../nodeDetail.type'
import {
    flatContainers,
    getFirstOrNull,
    getGroupedContainerOptions,
    getInitialPodContainerSelection,
    getPodContainerOptions,
    getPodLogsOptions,
    getSelectedPodList,
} from '../nodeDetail.util'
import CustomLogsModal from './CustomLogsModal/CustomLogsModal'
import LogViewerComponent from './LogViewer.component'
import { SelectedCustomLogFilterType } from './node.type'

import './nodeDetailTab.scss'

const subject: Subject<string> = new Subject()
const commandLineParser = require('command-line-parser')

const LogsComponent = ({
    selectedTab,
    isDeleted,
    logSearchTerms,
    setLogSearchTerms,
    isResourceBrowserView,
    selectedResource,
}: LogsComponentProps) => {
    const [logsShownOption, setLogsShownOption] = useState({
        prev: getPodLogsOptions()[5],
        current: getPodLogsOptions()[5],
    })
    const [selectedCustomLogFilter, setSelectedCustomLogFilter] = useState<SelectedCustomLogFilterType>({
        option: 'duration',
        value: '',
        unit: 'minutes',
    })
    const location = useLocation()
    const { url } = useRouteMatch()
    const params = useParams<{
        actionName: string
        podName: string
        clusterId: string
        nodeType: string
        name: string
        namespace: string
        kind?: string
    }>()
    params.nodeType = params.kind ?? params.nodeType
    const key = useKeyDown()
    const { isDownloading, handleDownload } = useDownload()
    const [logsPaused, setLogsPaused] = useState(false)
    const [tempSearch, setTempSearch] = useState<string>('')
    const [highlightString, setHighlightString] = useState('')
    const [logsCleared, setLogsCleared] = useState(false)
    const [readyState, setReadyState] = useState(null)
    const showStreamErrorRef = useRef(false)
    const logsPausedRef = useRef(false)
    const workerRef = useRef(null)
    const appDetails = IndexStore.getAppDetails()
    const isLogAnalyzer = !params.podName && !params.name
    const [logState, setLogState] = useState(() =>
        getInitialPodContainerSelection(isLogAnalyzer, params, location, isResourceBrowserView, selectedResource),
    )
    const [prevContainer, setPrevContainer] = useState(false)
    const [showNoPrevContainer, setNoPrevContainer] = useState('')
    const [newFilteredLogs, setNewFilteredLogs] = useState<boolean>(false)
    const [showCustomOptionsModal, setShowCustomOptionsMoadal] = useState(false)
    const getPrevContainerLogs = () => {
        setPrevContainer(!prevContainer)
    }

    const handlePodSelection = (selectedOption: string) => {
        if (selectedOption.startsWith('All ')) {
            ReactGA.event({
                category: 'log analyser',
                action: 'all-pods-selected',
                label: '',
            })
        }

        const pods = getSelectedPodList(selectedOption)
        const containers = new Set(pods[0].containers ?? [])
        const selectedContainer = containers.has(logState.selectedContainerOption)
            ? logState.selectedContainerOption
            : ''

        setLogState({
            selectedPodOption: selectedOption,
            selectedContainerOption: selectedContainer,
            grepTokens: logState.grepTokens,
        })
    }

    const handleContainerChange = (selectedContainer: string) => {
        setLogState({
            selectedPodOption: logState.selectedPodOption,
            selectedContainerOption: selectedContainer,
            grepTokens: logState.grepTokens,
        })
        setPrevContainer(false)
    }

    const parsePipes = (expression: string): string[] => {
        const pipes = expression.split(/[|\s]*grep[\s]*/).filter((p) => !!p)
        return pipes
    }

    const getGrepTokens = (expression) => {
        const options = commandLineParser({
            args: expression.replace(/"/g, '').split(' '),
            booleanKeys: ['v'],
            allowEmbeddedValues: true,
        })
        let { A, B } = options
        const { _args, C = 0, a = 0, b = 0, c = 0, v = false } = options
        if (C || c) {
            A = C || c
            B = C || c
        }

        return _args ? { _args: _args.join(' '), a: Number(A || a), b: Number(B || b), v } : null
    }

    const handleSearchTextChange = (searchText: string) => {
        if (!searchText) {
            setLogState({
                selectedPodOption: logState.selectedPodOption,
                selectedContainerOption: logState.selectedContainerOption,
                grepTokens: undefined,
            })
            return
        }
        const pipes = parsePipes(searchText)
        const tokens = pipes.map((p) => getGrepTokens(p))
        if (tokens.some((t) => !t)) {
            ToastManager.showToast({
                variant: ToastVariantType.warn,
                description: 'Expression is invalid.',
            })
            return
        }
        setLogState({
            selectedPodOption: logState.selectedPodOption,
            selectedContainerOption: logState.selectedContainerOption,
            grepTokens: tokens,
        })
    }

    const podContainerOptions = getPodContainerOptions(
        isLogAnalyzer,
        params,
        location,
        logState,
        isResourceBrowserView,
        selectedResource,
    )

    const updateLogsAndReadyState = (event: any) => {
        event.data.result.forEach((log: string) => {
            subject.publish(log)
            if (prevContainer) {
                podContainerOptions.containerOptions.forEach((_co) => {
                    if (
                        _co.selected &&
                        log.toString() ===
                            `previous terminated container "${_co.name}" in pod "${podContainerOptions.podOptions[0].name}" not found`
                    ) {
                        setNoPrevContainer(log.toString())
                    }
                })
            } else {
                setNoPrevContainer('')
            }
        })
        if (event.data.readyState) {
            setReadyState(event.data.readyState)
        }
    }

    const handleMessage = (event: any) => {
        if (!event || !event.data || !event.data.result || logsPausedRef.current) {
            noop()
        } else if (event.data.result?.length === 1 && event.data.signal === 'CUSTOM_ERR_STREAM') {
            if (!showStreamErrorRef.current) {
                updateLogsAndReadyState(event)
                showStreamErrorRef.current = true
            }
        } else {
            updateLogsAndReadyState(event)
        }
    }

    const stopWorker = () => {
        if (workerRef.current) {
            try {
                workerRef.current.postMessage({ type: 'stop' })
                workerRef.current.terminate()
                showStreamErrorRef.current = false
            } catch {
                noop()
            }
        }
    }

    const handleLogsPause = () => {
        setLogsPaused(!logsPaused)
    }

    const onLogsCleared = () => {
        setLogsCleared(true)
        setTimeout(() => setLogsCleared(false), 100)
    }

    const handleDownloadLogs = () => {
        const nodeName = podContainerOptions.podOptions[0].name
        if (isResourceBrowserView) {
            podContainerOptions.containerOptions.forEach((_co) => {
                if (_co.selected) {
                    downloadLogs(
                        handleDownload,
                        appDetails,
                        nodeName,
                        _co.name,
                        prevContainer,
                        logsShownOption.current,
                        selectedCustomLogFilter,
                        isResourceBrowserView,
                        selectedResource.clusterId,
                        selectedResource.namespace,
                    )
                }
            })
        } else {
            const selectedPods = podContainerOptions.podOptions
                .filter((_pod) => _pod.selected)
                .flatMap((_pod) => getSelectedPodList(_pod.name))

            const containers = podContainerOptions.containerOptions.filter((_co) => _co.selected).map((_co) => _co.name)
            const podsWithContainers = selectedPods
                .flatMap((_pod) => flatContainers(_pod).map((_container) => [_pod.name, _container]))
                .filter((_pwc) => containers.includes(_pwc[1]))

            podsWithContainers.forEach((_pwc) => {
                downloadLogs(
                    handleDownload,
                    appDetails,
                    _pwc[0],
                    _pwc[1],
                    prevContainer,
                    logsShownOption.current,
                    selectedCustomLogFilter,
                )
            })
        }
    }

    const fetchLogs = () => {
        if (podContainerOptions.podOptions.length === 0 || podContainerOptions.containerOptions.length === 0) {
            return
        }
        workerRef.current = new WebWorker(sseWorker)
        workerRef.current['addEventListener' as any]('message', handleMessage)

        const pods = []
        const urls = []

        if (isResourceBrowserView) {
            const nodeName = podContainerOptions.podOptions[0].name
            pods.push(nodeName)
            podContainerOptions.containerOptions.forEach((_co) => {
                if (_co.selected) {
                    urls.push(
                        getLogsURL(
                            appDetails,
                            nodeName,
                            Host,
                            _co.name,
                            prevContainer,
                            params.podName,
                            logsShownOption.current,
                            selectedCustomLogFilter,
                            isResourceBrowserView,
                            selectedResource.clusterId,
                            selectedResource.namespace,
                        ),
                    )
                }
            })
        } else {
            const selectedPods = podContainerOptions.podOptions
                .filter((_pod) => _pod.selected)
                .flatMap((_pod) => getSelectedPodList(_pod.name))

            const containers = podContainerOptions.containerOptions.filter((_co) => _co.selected).map((_co) => _co.name)
            const podsWithContainers = selectedPods
                .flatMap((_pod) => flatContainers(_pod).map((_container) => [_pod.name, _container]))
                .filter((_pwc) => containers.includes(_pwc[1]))

            podsWithContainers.forEach((_pwc) => {
                pods.push(_pwc[0])
                urls.push(
                    getLogsURL(
                        appDetails,
                        _pwc[0],
                        Host,
                        _pwc[1],
                        prevContainer,
                        params.podName,
                        logsShownOption.current,
                        selectedCustomLogFilter,
                    ),
                )
            })

            if (urls.length === 0) {
                return
            }
        }
        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: {
                urls,
                grepTokens: logState.grepTokens,
                timeout: 300,
                pods,
            },
        })
        setNewFilteredLogs(false)
    }

    const handleCurrentSearchTerm = (searchTerm: string): void => {
        setLogSearchTerms({
            ...logSearchTerms,
            [isLogAnalyzer
                ? AppDetailsTabs.log_analyzer
                : `${params.nodeType}/${isResourceBrowserView ? params.name : params.podName}`]: searchTerm,
        })
    }

    const handleLogsSearch = (_searchText: string): void => {
        setTempSearch(_searchText)
        const str = replaceLastOddBackslash(_searchText)
        handleSearchTextChange(str)
        const { length, [length - 1]: highlightStringLocal } = str.split(' ')
        setHighlightString(highlightStringLocal)
        handleCurrentSearchTerm(str)
    }

    const handleLogOptionChange = (selected) => {
        setLogsShownOption({
            prev: logsShownOption.current,
            current: selected,
        })
        if (selected.value !== CUSTOM_LOGS_FILTER.CUSTOM) {
            setNewFilteredLogs(true)
        } else {
            setShowCustomOptionsMoadal(true)
        }
    }

    useEffect(() => {
        logsPausedRef.current = logsPaused
    }, [logsPaused])

    useEffect(() => {
        const combo = key.join()
        if (combo === 'Control,c') {
            handleLogsPause()
        }
    }, [key.join()])

    const handleLogSearchSubmit = (e) => {
        e.preventDefault()
    }

    useEffect(() => {
        if (selectedTab) {
            selectedTab(NodeDetailTab.LOGS, url)
        }
        setLogState(
            getInitialPodContainerSelection(isLogAnalyzer, params, location, isResourceBrowserView, selectedResource),
        )

        if (logSearchTerms) {
            const currentSearchTerm =
                logSearchTerms[
                    isLogAnalyzer
                        ? AppDetailsTabs.log_analyzer
                        : `${params.nodeType}/${isResourceBrowserView ? params.name : params.podName}`
                ]

            if (currentSearchTerm) {
                setTempSearch(currentSearchTerm)
                handleSearchTextChange(currentSearchTerm)
                const { length, [length - 1]: highlightStringLocal } = currentSearchTerm.split(' ')
                setHighlightString(highlightStringLocal)
            }
        }
        // TODO: reset pauseLog and grepToken
    }, [params.podName, params.name, params.namespace])

    useEffect(() => {
        // Values are already set once we reach here
        // selected pods, containers, searchText
        onLogsCleared()
        stopWorker()
        fetchLogs()

        return () => stopWorker()
    }, [logState, prevContainer, newFilteredLogs])

    const getPodGroups = () => {
        const allGroupPods = []
        const individualPods = []

        const podCreate = (podGroupName, _pod: Options) => {
            podGroupName.push({
                label: _pod.name,
                value: _pod.name,
            })
        }

        podContainerOptions.podOptions.forEach((pod) => {
            if (pod.name.startsWith('All ')) {
                podCreate(allGroupPods, pod)
            } else {
                podCreate(individualPods, pod)
            }
        })
        return [
            {
                label: 'ALL PODS FOR',
                options: allGroupPods,
            },
            {
                label: 'INDIVIDUAL PODS',
                options: individualPods,
            },
        ]
    }

    const renderOption = (props) => <Option {...props} showTippy style={{ direction: 'rtl' }} />

    const renderSearchText = (): JSX.Element => (
        <SearchBar
            initialSearchText={tempSearch}
            containerClassName="w-100 bg__primary"
            handleEnter={handleLogsSearch}
            inputProps={{
                placeholder: `grep -A 10 -B 20 "Server Error" | grep 500`,
            }}
            dataTestId="Search-by-app-name"
            noBackgroundAndBorder
        />
    )

    return isDeleted ? (
        <MessageUI msg="This resource no longer exists" size={32} />
    ) : (
        <>
            <div className="node-container-fluid bg__primary">
                <div data-testid="logs-container-header" className="pl-16 h-32 flexbox border__secondary--bottom">
                    <div className="w-70 flexbox flex-align-center pt-2 pb-2">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                        >
                            <div
                                className={`mr-8 ${logsPaused ? 'play' : 'stop'} flex`}
                                onClick={() => handleLogsPause()}
                                data-testid="logs-stop-button"
                            >
                                {logsPaused ? (
                                    <PlayButton className="icon-dim-16 fcg-5 cursor" />
                                ) : (
                                    <StopButton className="icon-dim-16 fcr-5 cursor" />
                                )}
                            </div>
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                            <div className="ml-8 flex">
                                <Abort
                                    data-testid="clear-logs-container"
                                    onClick={() => {
                                        onLogsCleared()
                                    }}
                                    className="icon-dim-16 cursor"
                                />
                            </div>
                        </Tippy>
                        {isLogAnalyzer && podContainerOptions.podOptions.length > 0 && (
                            <>
                                <div className="h-16 dc__border-right ml-8 mr-8" />

                                <>
                                    <div className="cn-6 ml-8 mr-10 ">Pods</div>
                                    <div className="cn-6 flex left">
                                        <div style={{ width: '200px' }}>
                                            <Select
                                                placeholder="Select Pod"
                                                options={getPodGroups()}
                                                defaultValue={getFirstOrNull<{ label: string; value: string }>(
                                                    podContainerOptions.podOptions.map((_pod) => ({
                                                        label: _pod.name,
                                                        value: _pod.name,
                                                    })),
                                                )}
                                                onChange={(selected) => handlePodSelection(selected.value)}
                                                styles={{
                                                    ...multiSelectStyles,
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 9999,
                                                        backgroundColor: 'var(--bg-menu-primary)',
                                                        textAlign: 'left',
                                                    }),
                                                    control: (base) => ({
                                                        ...base,
                                                        borderColor: 'transparent',
                                                        backgroundColor: 'transparent',
                                                        minHeight: '24px !important',
                                                        cursor: 'pointer',
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: '0 8px',
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0',
                                                        paddingTop: '0',
                                                        color: 'var(--N900)',
                                                    }),
                                                    groupHeading: (base) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        fontSize: '10px',
                                                        color: 'var(--N700)',
                                                        marginLeft: 0,
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        color: 'var(--N900)',
                                                        direction: 'rtl',
                                                        textAlign: 'left',
                                                        marginLeft: '2px',
                                                    }),
                                                    indicatorsContainer: (provided) => ({
                                                        ...provided,
                                                    }),
                                                    dropdownIndicator: (base) => ({
                                                        ...base,
                                                        padding: '0',
                                                    }),
                                                }}
                                                components={{
                                                    IndicatorSeparator: null,
                                                    Option: renderOption,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            </>
                        )}

                        {(podContainerOptions?.containerOptions ?? []).length > 0 && (
                            <>
                                <div className="h-16 dc__border-right ml-8 mr-8" />
                                <div className="cn-6 ml-8 mr-10">Container </div>
                                <div className="dc__mxw-200">
                                    <Select
                                        placeholder="Select Containers"
                                        classNamePrefix="containers-select"
                                        options={getGroupedContainerOptions(podContainerOptions.containerOptions)}
                                        value={getFirstOrNull(
                                            podContainerOptions.containerOptions
                                                .filter((_container) => _container.selected)
                                                .map((_container) => ({
                                                    label: _container.name,
                                                    value: _container.name,
                                                })),
                                        )}
                                        onChange={(selected) => {
                                            handleContainerChange((selected as any).value as string)
                                        }}
                                        styles={{
                                            ...multiSelectStyles,
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                                textAlign: 'left',
                                                width: '150px',
                                                backgroundColor: 'var(--bg-menu-primary)',
                                            }),
                                            menuList: (base) => ({
                                                ...base,
                                                paddingTop: 0,
                                            }),
                                            control: (base) => ({
                                                ...base,
                                                borderColor: 'transparent',
                                                backgroundColor: 'transparent',
                                                minHeight: '24px !important',
                                                cursor: 'pointer',
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                padding: '0 8px',
                                            }),
                                            input: (base) => ({
                                                ...base,
                                                margin: '0',
                                                paddingTop: '0',
                                                color: 'var(--N900)',
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                fontWeight: 600,
                                                color: 'var(--N900)',
                                                direction: 'rtl',
                                                textAlign: 'left',
                                                marginLeft: '2px',
                                            }),
                                            indicatorsContainer: (provided) => ({
                                                ...provided,
                                            }),
                                            dropdownIndicator: (base) => ({
                                                ...base,
                                                padding: '0',
                                            }),
                                        }}
                                        components={{
                                            IndicatorSeparator: null,
                                            Option: renderOption,
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        <div className="h-16 dc__border-right ml-8 mr-8" />
                        <Checkbox
                            dataTestId="prev-container-logs"
                            isChecked={prevContainer}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={getPrevContainerLogs}
                            rootClassName="fs-12 cn-9 mt-4"
                        >
                            <span className="fs-12 ">Prev. container</span>
                        </Checkbox>
                        <div className="h-16 dc__border-right ml-8 mr-8" />
                        <LinesIcon className="icon-dim-16 mr-8" />
                        <Select
                            options={getPodLogsOptions()}
                            onChange={handleLogOptionChange}
                            value={logsShownOption.current}
                            styles={{
                                ...multiSelectStyles,
                                ...podsDropdownStyles,
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                        <div className="h-16 dc__border-right ml-8 mr-8" />
                        {isDownloading ? (
                            <Progressing
                                size={16}
                                styles={{ display: 'flex', justifyContent: 'flex-start', width: 'max-content' }}
                            />
                        ) : (
                            <Tippy className="default-tt" arrow={false} placement="top" content="Download logs">
                                <span className="flex">
                                    <Download
                                        className={`icon-dim-16 mr-8 cursor ${
                                            (podContainerOptions?.containerOptions ?? []).length === 0 ||
                                            (prevContainer && showNoPrevContainer !== '')
                                                ? 'cursor-not-allowed dc__opacity-0_5'
                                                : ''
                                        }`}
                                        onClick={handleDownloadLogs}
                                    />
                                </span>
                            </Tippy>
                        )}
                    </div>
                    <div className="dc__border-right " />
                    <form
                        className="w-30 flex flex-justify left bcn-1 flex-align-center "
                        onSubmit={handleLogSearchSubmit}
                    >
                        {renderSearchText()}
                        <div className="dc__border-right h-100" />
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={
                                <div>
                                    <div className="flex column left ">
                                        <h5>Supported grep commands</h5>
                                        <span>grep 500</span>
                                        <span>grep -A 2 -B 3 -C 5 error</span>
                                        <span>grep 500 | grep internal</span>
                                    </div>
                                </div>
                            }
                        >
                            <div className="bg__primary flexbox flex-align-center dc__no-shrink p-8">
                                <ICHelpOutline className="icon-dim-16 cursor fcn-7" />
                            </div>
                        </Tippy>
                    </form>
                </div>
            </div>
            {podContainerOptions.containerOptions.filter((_co) => _co.selected).length > 0 &&
                podContainerOptions.podOptions.filter((_po) => _po.selected).length > 0 && (
                    <div
                        data-testid="app-logs-container"
                        style={{
                            background: 'var(--terminal-bg)',
                        }}
                        className="flex flex-grow-1 column log-viewer-container"
                    >
                        <div
                            className={`pod-readyState pod-readyState--top bcr-7 w-100 pl-20 ${
                                logsPaused || readyState === 2 ? 'pod-readyState--show' : ''
                            }`}
                        >
                            {logsPaused && (
                                <div className="w-100 cn-0">
                                    Stopped printing logs.{' '}
                                    <span onClick={() => handleLogsPause()} className="pointer dc__underline">
                                        Resume ( Ctrl+c )
                                    </span>
                                </div>
                            )}
                            {readyState === 2 && (
                                <div className="w-100 cn-0">
                                    Disconnected.{' '}
                                    <span onClick={() => fetchLogs()} className="pointer dc__underline">
                                        Reconnect
                                    </span>
                                </div>
                            )}
                        </div>

                        {prevContainer && showNoPrevContainer !== '' ? (
                            <MessageUI dataTestId="no-prev-container-logs" msg={showNoPrevContainer} size={24} />
                        ) : (
                            <div
                                className={`flexbox-col flex-grow-1 w-100 h-100 ${getComponentSpecificThemeClass(AppThemeType.dark)}`}
                            >
                                <div className="log-viewer">
                                    <LogViewerComponent
                                        subject={subject}
                                        highlightString={highlightString}
                                        rootClassName="event-logs__logs"
                                        reset={logsCleared}
                                    />
                                </div>
                            </div>
                        )}

                        <div
                            className={`pod-readyState pod-readyState--bottom w-100 ${
                                !logsPaused && [0, 1].includes(readyState) ? 'pod-readyState--show' : ''
                            }`}
                        >
                            {readyState === 0 && (
                                <div
                                    className="readyState dc__loading-dots"
                                    style={{ color: 'orange' }}
                                    data-testid="logs-connected-status"
                                >
                                    Connecting
                                </div>
                            )}
                            {readyState === 1 && (
                                <div
                                    className="readyState dc__loading-dots cg-5 pl-20"
                                    data-testid="logs-connected-status"
                                >
                                    Connected
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {podContainerOptions.containerOptions.filter((_co) => _co.selected).length === 0 && (
                <div className="no-pod no-pod--container flex-grow-1">
                    <MessageUI
                        icon={MsgUIType.MULTI_CONTAINER}
                        msg={`${
                            (podContainerOptions?.containerOptions ?? []).length > 0
                                ? 'Select a container to view logs'
                                : 'No container'
                        }`}
                        size={32}
                    />
                </div>
            )}

            {showCustomOptionsModal && (
                <CustomLogsModal
                    setSelectedCustomLogFilter={setSelectedCustomLogFilter}
                    selectedCustomLogFilter={selectedCustomLogFilter}
                    setLogsShownOption={setLogsShownOption}
                    setNewFilteredLogs={setNewFilteredLogs}
                    setShowCustomOptionsMoadal={setShowCustomOptionsMoadal}
                />
            )}
        </>
    )
}

export default LogsComponent
