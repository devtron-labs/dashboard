import Tippy from '@tippyjs/react'
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg'
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg'
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg'
import { useParams, useRouteMatch, useLocation } from 'react-router'
import { NodeDetailTab } from '../nodeDetail.type'
import { getLogsURL } from '../nodeDetail.api'
import IndexStore from '../../../index.store'
import WebWorker from '../../../../../app/WebWorker'
import sseWorker from '../../../../../app/grepSSEworker'
import { Checkbox, CHECKBOX_VALUE, Host} from '@devtron-labs/devtron-fe-common-lib';
import { Subject } from '../../../../../../util/Subject'
import LogViewerComponent from './LogViewer.component'
import { useKeyDown } from '../../../../../common'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization'
import { LogsComponentProps, Options } from '../../../appDetails.type'
import { ReactComponent as Question } from '../../../../assets/icons/ic-question.svg'
import { ReactComponent as CloseImage } from '../../../../assets/icons/ic-cancelled.svg'
import MessageUI, { MsgUIType } from '../../../../common/message.ui'
import { Option } from '../../../../common/ReactSelect.utils'
import { AppDetailsTabs } from '../../../appDetails.store'
import { replaceLastOddBackslash } from '../../../../../../util/Util'
import {
    flatContainers,
    getFirstOrNull,
    getGroupedContainerOptions,
    getInitialPodContainerSelection,
    getPodContainerOptions,
    getSelectedPodList,
} from '../nodeDetail.util'
import './nodeDetailTab.scss'

const subject: Subject<string> = new Subject()
const commandLineParser = require('command-line-parser')

function LogsComponent({
    selectedTab,
    isDeleted,
    logSearchTerms,
    setLogSearchTerms,
    isResourceBrowserView,
    selectedResource,
}: LogsComponentProps) {
    const location = useLocation()
    const { url } = useRouteMatch()
    const params = useParams<{
        actionName: string
        podName: string
        clusterId: string
        nodeType: string
        node: string
    }>()
    const key = useKeyDown()
    const [logsPaused, setLogsPaused] = useState(false)
    const [tempSearch, setTempSearch] = useState<string>('')
    const [highlightString, setHighlightString] = useState('')
    const [logsCleared, setLogsCleared] = useState(false)
    const [readyState, setReadyState] = useState(null)
    const showStreamErrorRef = useRef(false)
    const logsPausedRef = useRef(false)
    const workerRef = useRef(null)
    const appDetails = IndexStore.getAppDetails()
    const isLogAnalyzer = !params.podName && !params.node
    const [logState, setLogState] = useState(() =>
        getInitialPodContainerSelection(isLogAnalyzer, params, location, isResourceBrowserView, selectedResource),
    )
    const[prevContainer, setPrevContainer] = useState(false)
    const[showNoPrevContainer, setNoPrevContainer] = useState('')

    const getPrevContainerLogs = () => {
        setPrevContainer(!prevContainer)
    }

    const handlePodSelection = (selectedOption: string) => {
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
            toast.warn('Expression is invalid.')
            return
        }
        setLogState({
            selectedPodOption: logState.selectedPodOption,
            selectedContainerOption: logState.selectedContainerOption,
            grepTokens: tokens,
        })
    }

    const parsePipes = (expression: string): string[] => {
        const pipes = expression.split(/[\|\s]*grep[\s]*/).filter((p) => !!p)
        return pipes
    }

    const getGrepTokens = (expression) => {
        const options = commandLineParser({
            args: expression.replace(/"/g, '').split(' '),
            booleanKeys: ['v'],
            allowEmbeddedValues: true,
        })
        let { _args, A = 0, B = 0, C = 0, a = 0, b = 0, c = 0, v = false } = options
        if (C || c) {
            A = C || c
            B = C || c
        }

        return _args ? { _args: _args.join(' '), a: Number(A || a), b: Number(B || b), v } : null
    }

    const updateLogsAndReadyState = (event: any) => {
        event.data.result.forEach((log: string) => {
            subject.publish(log)
            if (prevContainer) {
                for (const _co of podContainerOptions.containerOptions) {
                    if ( _co.selected && log.toString() === `previous terminated container "${_co.name}" in pod "${podContainerOptions.podOptions[0].name}" not found`) {
                        setNoPrevContainer(log.toString())
                    }
                }
            } else setNoPrevContainer('')
        })
        if (event.data.readyState) {
            setReadyState(event.data.readyState)
        }
    }

    const handleMessage = (event: any) => {
        if (!event || !event.data || !event.data.result || logsPausedRef.current) {
            return
        } else if (event.data.result?.length === 1 && event.data.signal === 'CUSTOM_ERR_STREAM') {
            if (!showStreamErrorRef.current) {
                updateLogsAndReadyState(event)
                showStreamErrorRef.current = true
            }
            return
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
            } catch (err) {}
        }
    }

    const handleLogsPause = () => {
        setLogsPaused(!logsPaused)
    }

    const onLogsCleared = () => {
        setLogsCleared(true)
        setTimeout(() => setLogsCleared(false), 100)
    }

    const fetchLogs = () => {
        if (podContainerOptions.podOptions.length == 0 || podContainerOptions.containerOptions.length == 0) {
            return
        }
        workerRef.current = new WebWorker(sseWorker)
        workerRef.current['addEventListener' as any]('message', handleMessage)

        const pods = [],
            urls = []

        if (isResourceBrowserView) {
            const nodeName = podContainerOptions.podOptions[0].name
            pods.push(nodeName)

            for (const _co of podContainerOptions.containerOptions) {
                if (_co.selected) {
                    urls.push(
                        getLogsURL(
                            appDetails,
                            nodeName,
                            Host,
                            _co.name,
                            prevContainer,
                            isResourceBrowserView,
                            selectedResource.clusterId,
                            selectedResource.namespace,
                        ),
                    )
                }
            }
        } else {
            const selectedPods = podContainerOptions.podOptions
                .filter((_pod) => _pod.selected)
                .flatMap((_pod) => getSelectedPodList(_pod.name))

            const containers = podContainerOptions.containerOptions.filter((_co) => _co.selected).map((_co) => _co.name)
            const podsWithContainers = selectedPods
                .flatMap((_pod) => flatContainers(_pod).map((_container) => [_pod.name, _container]))
                .filter((_pwc) => containers.includes(_pwc[1]))

            for (const _pwc of podsWithContainers) {
                pods.push(_pwc[0])
                urls.push(getLogsURL(appDetails, _pwc[0], Host, _pwc[1], prevContainer))
            }

            if (urls.length == 0) {
                return
            }
        }

        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: {
                urls: urls,
                grepTokens: logState.grepTokens,
                timeout: 300,
                pods: pods,
            },
        })
    }

    const handleCurrentSearchTerm = (searchTerm: string): void => {
        setLogSearchTerms({
            ...logSearchTerms,
            [isLogAnalyzer
                ? AppDetailsTabs.log_analyzer
                : `${params.nodeType}/${isResourceBrowserView ? params.node : params.podName}`]: searchTerm,
        })
    }

    const handleLogsSearch = (e) => {
        e.preventDefault()
        if (e.key === 'Enter' || e.keyCode === 13) {
            const str = replaceLastOddBackslash(e.target.value)
            handleSearchTextChange(str)
            const { length, [length - 1]: highlightString } = str.split(' ')
            setHighlightString(highlightString)
            handleCurrentSearchTerm(str)
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
                        : `${params.nodeType}/${isResourceBrowserView ? params.node : params.podName}`
                ]

            if (currentSearchTerm) {
                setTempSearch(currentSearchTerm)
                handleSearchTextChange(currentSearchTerm)
                const { length, [length - 1]: highlightString } = currentSearchTerm.split(' ')
                setHighlightString(highlightString)
            }
        }
        //TODO: reset pauseLog and grepToken
    }, [params.podName, params.node])

    useEffect(() => {
        //Values are already set once we reach here
        //selected pods, containers, searchText
        onLogsCleared()
        stopWorker()
        fetchLogs()

        return () => stopWorker()
    }, [logState, prevContainer])

    const podContainerOptions = getPodContainerOptions(
        isLogAnalyzer,
        params,
        location,
        logState,
        isResourceBrowserView,
        selectedResource,
    )

    const getPodGroups = () => {
        const allGroupPods = [],
            individualPods = []

        const podCreate = (podGroupName, _pod: Options) => {
            podGroupName.push({
                label: _pod.name,
                value: _pod.name,
            })
        }

        podContainerOptions.podOptions.map((pod) => {
            pod.name.startsWith('All ') ? podCreate(allGroupPods, pod) : podCreate(individualPods, pod)
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

    return isDeleted ? (
        <div>
            <MessageUI
                msg="This resource no longer exists"
                size={32}
                minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
            />
        </div>
    ) : (
        <React.Fragment>
            <div className="node-container-fluid bcn-0">
                <div
                    data-testid="logs-container-header"
                    className={`node-row pt-2 pb-2 pl-16 pr-16 ${!isLogAnalyzer ? 'dc__border-top' : ''}`}
                >
                    <div className="col-6 flexbox flex-align-center">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                        >
                            <div
                                className={`mr-8 ${logsPaused ? 'play' : 'stop'} flex`}
                                onClick={(e) => handleLogsPause()}
                                data-testid="logs-stop-button"
                            >
                                {logsPaused ? (
                                    <PlayButton className="icon-dim-16 cursor" />
                                ) : (
                                    <StopButton className="icon-dim-16 cursor" />
                                )}
                            </div>
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} placement="bottom" content={'Clear'}>
                            <Abort
                                data-testid="clear-logs-container"
                                onClick={(e) => {
                                    onLogsCleared()
                                }}
                                className="icon-dim-20 ml-8 cursor"
                            />
                        </Tippy>
                        <div
                            className="cn-2 ml-8 mr-8 "
                            style={{ width: '1px', height: '16px', background: '#0b0f22' }}
                        ></div>
                        {isLogAnalyzer && podContainerOptions.podOptions.length > 0 && (
                            <React.Fragment>
                                <div className="cn-6 ml-8 mr-10 ">Pods</div>
                                <div className="cn-6 flex left">
                                    <div style={{ width: '200px' }}>
                                        <Select
                                            placeholder="Select Pod"
                                            options={getPodGroups()}
                                            defaultValue={getFirstOrNull(
                                                podContainerOptions.podOptions
                                                    .filter((_pod) => _pod.selected)
                                                    .map((_pod) => ({ label: _pod.name, value: _pod.name })),
                                            )}
                                            onChange={(selected) => handlePodSelection(selected.value)}
                                            styles={{
                                                ...multiSelectStyles,
                                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderColor: 'transparent',
                                                    backgroundColor: 'transparent',
                                                    minHeight: '24px !important',
                                                    cursor: 'pointer',
                                                }),
                                                groupHeading: (base) => ({
                                                    ...base,
                                                    fontWeight: 600,
                                                    fontSize: '10px',
                                                    color: 'var(--n-700)',
                                                    marginLeft: 0,
                                                }),
                                                singleValue: (base, state) => ({
                                                    ...base,
                                                    fontWeight: 600,
                                                    color: '#06c',
                                                    direction: 'rtl',
                                                    textAlign: 'left',
                                                    marginLeft: '2px',
                                                }),
                                                indicatorsContainer: (provided, state) => ({
                                                    ...provided,
                                                }),
                                            }}
                                            components={{
                                                IndicatorSeparator: null,
                                                Option: (props) => (
                                                    <Option {...props} showTippy={true} style={{ direction: 'rtl' }} />
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}

                        {(podContainerOptions?.containerOptions ?? []).length > 0 && (
                            <React.Fragment>
                                <div className="cn-6 ml-8 mr-10">Container </div>
                                <div style={{ width: '150px' }}>
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
                                            menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                            menuList: (base) => ({
                                                ...base,
                                                paddingTop: 0,
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: 'transparent',
                                                backgroundColor: 'transparent',
                                                minHeight: '24px !important',
                                                cursor: 'pointer',
                                            }),
                                            singleValue: (base, state) => ({
                                                ...base,
                                                fontWeight: 600,
                                                color: '#06c',
                                                direction: 'rtl',
                                                textAlign: 'left',
                                                marginLeft: '2px',
                                            }),
                                            indicatorsContainer: (provided, state) => ({
                                                ...provided,
                                            }),
                                        }}
                                        components={{
                                            IndicatorSeparator: null,
                                            Option: (props) => (
                                                <Option {...props} showTippy={true} style={{ direction: 'rtl' }} />
                                            ),
                                        }}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                            <div
                                className="cn-2 ml-8 mr-12 line_separator"
                            ></div>
                            <Checkbox
                                dataTestId="prev-container-logs"
                                isChecked={prevContainer}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={getPrevContainerLogs}
                                rootClassName="fs-12 cn-9 mt-4"
                            >
                                <span className="fs-12">Prev. container</span>
                            </Checkbox>
                    </div>

                    <form
                        className="col-6 flex flex-justify left w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12"
                        onSubmit={handleLogSearchSubmit}
                    >
                        <input
                            value={tempSearch}
                            className="bw-0 w-100"
                            style={{ background: 'transparent', outline: 'none' }}
                            onKeyUp={handleLogsSearch}
                            onChange={(e) => setTempSearch(e.target.value as string)}
                            type="search"
                            name="log_search_input"
                            placeholder='grep -A 10 -B 20 "Server Error" | grep 500'
                        />
                        {logState.grepTokens && (
                            <CloseImage
                                className="icon-dim-20 pointer"
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleSearchTextChange('')
                                    setHighlightString('')
                                    setTempSearch('')
                                    handleCurrentSearchTerm('')
                                }}
                            />
                        )}
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
                            <Question className="icon-dim-24 cursor" />
                        </Tippy>
                    </form>
                </div>
            </div>
            {podContainerOptions.containerOptions.filter((_co) => _co.selected).length > 0 &&
                podContainerOptions.podOptions.filter((_po) => _po.selected).length > 0 && (
                    <div
                        data-testid="app-logs-container"
                        style={{
                            gridColumn: '1 / span 2',
                            background: '#0b0f22',
                            minHeight: isResourceBrowserView ? '200px' : '600px',
                        }}
                        className="flex column log-viewer-container"
                    >
                        <div
                            className={`pod-readyState pod-readyState--top bcr-7 w-100 pl-20 ${
                                logsPaused || readyState === 2 ? 'pod-readyState--show' : ''
                            }`}
                        >
                            {logsPaused && (
                                <div className="w-100 cn-0">
                                    Stopped printing logs.{' '}
                                    <span onClick={(e) => handleLogsPause()} className="pointer dc__underline">
                                        Resume ( Ctrl+c )
                                    </span>
                                </div>
                            )}
                            {readyState === 2 && (
                                <div className="w-100 cn-0">
                                    Disconnected.{' '}
                                    <span onClick={(e) => fetchLogs()} className="pointer dc__underline">
                                        Reconnect
                                    </span>
                                </div>
                            )}
                        </div>

                        {(prevContainer && showNoPrevContainer != '') ? (
                            <MessageUI
                                dataTestId="no-prev-container-logs"
                                msg={showNoPrevContainer}
                                size={24}
                                minHeight={isResourceBrowserView ? '200px' : ''}
                                msgStyle={{ maxWidth: '300px', margin: '8px auto' }}
                            />
                        ) :
                            <div className="log-viewer">
                                <LogViewerComponent
                                    subject={subject}
                                    highlightString={highlightString}
                                    rootClassName="event-logs__logs"
                                    reset={logsCleared}
                                />
                            </div>
                        }

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

            {podContainerOptions.containerOptions.filter((_co) => _co.selected).length == 0 && (
                <div className="no-pod no-pod--container ">
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
        </React.Fragment>
    )
}

export default LogsComponent
