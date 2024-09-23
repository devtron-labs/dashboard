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
import { useParams, useRouteMatch } from 'react-router-dom'
import { get, showError, stopPropagation, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { NodeDetailTab, ResponsePayload } from '../nodeDetail.type'
import IndexStore from '../../../index.store'
import MessageUI from '../../../../common/message.ui'
import { getCustomOptionSelectionStyle } from '../../../../common/ReactSelect.utils'
import {
    getK8sResourcePayloadAppType,
    getContainerSelectStyles,
    getGroupedContainerOptions,
    getShellSelectStyles,
} from '../nodeDetail.util'
import { shellTypes } from '../../../../../../config/constants'
import { OptionType } from '../../../../../app/types'
import { AppType, TerminalComponentProps, Options } from '../../../appDetails.type'
import './nodeDetailTab.scss'
import TerminalWrapper from './terminal/TerminalWrapper.component'
import { TerminalSelectionListDataType } from './terminal/terminal.type'
import { SocketConnectionType } from '../../../../../ClusterNodes/constants'
import { TerminalWrapperType } from './terminal/constants'
import { getAppId, generateDevtronAppIdentiferForK8sRequest, deleteEphemeralUrl } from '../nodeDetail.api'
import { ReactComponent as Cross } from '../../../../../../assets/icons/ic-cross.svg'

let clusterTimeOut

const TerminalComponent = ({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
    selectedContainer,
    setSelectedContainer,
    containers,
    selectedContainerName,
    setSelectedContainerName,
    switchSelectedContainer,
    setContainers,
    showTerminal,
}: TerminalComponentProps) => {
    const params = useParams<{
        actionName: string
        podName: string
        nodeType: string
        node: string
        clusterId?: string
        namespace: string
    }>()
    const { url } = useRouteMatch()
    const terminalRef = useRef(null)
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const selectedContainerValue = isResourceBrowserView ? selectedResource?.name : podMetaData?.name
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedTerminalType, setSelectedTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.DISCONNECTED)
    const [sessionId, setSessionId] = useState<string>()
    const connectTerminal: boolean =
        socketConnection === SocketConnectionType.CONNECTING || socketConnection === SocketConnectionType.CONNECTED
    const appDetails = IndexStore.getAppDetails()
    const nodeName = isResourceBrowserView ? params.node : params.podName
    const selectedNamespace = appDetails.resourceTree?.nodes?.find(
        (nd) => nd.name === params.podName || nd.name === params.podName,
    )?.namespace

    function Option(props) {
        const { selectProps, data, style } = props
        const getPayload = (containerName: string) => {
            const payload: ResponsePayload = {
                namespace: isResourceBrowserView ? selectedResource.namespace : selectedNamespace,
                clusterId: isResourceBrowserView ? Number(params.clusterId) : appDetails.clusterId,
                podName: isResourceBrowserView ? params.node : params.podName,
                basicData: {
                    containerName,
                },
            }
            return payload
        }

        const deleteEphemeralContainer = (containerName: string) => {
            deleteEphemeralUrl({
                requestData: getPayload(containerName),
                clusterId: appDetails.clusterId,
                environmentId: appDetails.environmentId,
                namespace: appDetails.namespace,
                appName: appDetails.appName,
                appId: appDetails.appId,
                appType: appDetails.appType,
                fluxTemplateType: appDetails.fluxTemplateType,
                isResourceBrowserView,
                params,
            })
                .then((response: any) => {
                    const _containers: Options[] = []
                    const containerName = response.result
                    containers?.forEach((con) => {
                        if (containerName !== con.name) {
                            _containers.push(con)
                        }
                    })
                    switchSelectedContainer(containers?.[0]?.name || '')
                    setContainers(_containers)
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Deleted successfully',
                    })
                })
                .catch((error) => {
                    showError(error)
                })
        }

        selectProps.styles.option = getCustomOptionSelectionStyle(style)
        const getOption = () => {
            return (
                <div onClick={stopPropagation}>
                    <components.Option {...props}>
                        <div className={` ${data.isEphemeralContainer ? 'flex dc__content-space' : ''}`}>
                            {data.isEphemeralContainer && (
                                <Tippy
                                    className="default-white"
                                    arrow={false}
                                    placement="bottom"
                                    content={`${data.isExternal ? 'Externally created ephemeral containers cannot be removed' : 'Remove container'}`}
                                >
                                    <div className="flex">
                                        <Cross
                                            className={`icon-dim-16 ${data.isExternal ? 'cursor-not-allowed dc__opacity-0_5' : 'cursor'} ${props.isFocused && !data.isExternal ? 'scr-5' : ''}`}
                                            onClick={(selected) => {
                                                stopPropagation(selected)
                                                if (!data.isExternal) {
                                                    deleteEphemeralContainer(props.label)
                                                }
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            )}
                            {props.label}
                        </div>
                    </components.Option>
                </div>
            )
        }

        return getOption()
    }

    const generateSessionURL = () => {
        const appId =
            appDetails.appType == AppType.DEVTRON_APP
                ? generateDevtronAppIdentiferForK8sRequest(
                      appDetails.clusterId,
                      appDetails.appId,
                      appDetails.environmentId,
                  )
                : getAppId({
                      clusterId: appDetails.clusterId,
                      namespace: appDetails.namespace,
                      appName: appDetails.appName,
                      templateType: appDetails.fluxTemplateType ?? null,
                  })
        const isExternalArgoApp = appDetails.appType === AppType.EXTERNAL_ARGO_APP
        let url: string = 'k8s/pod/exec/session/'
        if (isResourceBrowserView) {
            url += `${selectedResource.clusterId}`
        } else {
            url += `${appId}`
        }
        url += `/${isResourceBrowserView ? selectedResource.namespace : selectedNamespace}/${nodeName}/${
            selectedTerminalType.value
        }/${selectedContainerName.value}`
        if (!isResourceBrowserView) {
            return `${url}?appType=${getK8sResourcePayloadAppType(appDetails.appType)}`
        }
        return url
    }

    const handleAbort = () => {
        setTerminalCleared(!terminalCleared)
    }

    const getNewSession = () => {
        if (
            !nodeName ||
            !selectedContainerName ||
            !selectedTerminalType.value ||
            (!isResourceBrowserView && !appDetails)
        ) {
            return
        }

        get(generateSessionURL())
            .then((response: any) => {
                handleAbort()
                const sessionId = response?.result.SessionID
                if (terminalRef.current) {
                    setSessionId(sessionId)
                }
            })
            .catch((err) => {
                showError(err)
            })
    }

    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL, url)
        handleAbort()
    }, [params.podName, params.node, params.namespace])

    useEffect(() => {
        if (showTerminal) {
            selectedTab(NodeDetailTab.TERMINAL, `${url}/terminal`)
        }
    }, [showTerminal])

    useEffect(() => {
        setSelectedContainerName({ label: _selectedContainer, value: _selectedContainer })
    }, [containers])
    useEffect(() => {
        clearTimeout(clusterTimeOut)
        if (terminalRef.current) {
            setSocketConnection(SocketConnectionType.DISCONNECTING)
            handleAbort()
            // Wait a short amount of time before attempting to reconnect
            clusterTimeOut = setTimeout(() => {
                setSocketConnection(SocketConnectionType.CONNECTING)
            }, 300)
        } else if (selectedContainerName.value) {
            setSocketConnection(SocketConnectionType.CONNECTING)
        }
    }, [selectedTerminalType, selectedContainerName.value, params.podName, params.node, params.namespace])

    useEffect(() => {
        if (socketConnection === SocketConnectionType.CONNECTING) {
            getNewSession()
        }
    }, [socketConnection])

    const handleDisconnect = () => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const handleConnect = () => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const handleContainerChange = (selected: OptionType) => {
        setSelectedContainerName(selected)
        setSelectedContainer(selectedContainer.set(selectedContainerValue, selected.value))
    }

    const handleShellChange = (selected: OptionType) => {
        setSelectedTerminalType(selected)
    }

    if (isDeleted || !selectedContainerName.value.length) {
        return (
            showTerminal && (
                <MessageUI
                    msg="This resource no longer exists"
                    size={32}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
                />
            )
        )
    }

    const selectionListData: TerminalSelectionListDataType = {
        firstRow: [
            {
                type: TerminalWrapperType.CONNECTION_BUTTON,
                connectTerminal,
                closeTerminalModal: handleDisconnect,
                reconnectTerminal: handleConnect,
            },
            {
                type: TerminalWrapperType.CLEAR_BUTTON,
                dataTestId: 'clear-terminal-editor',
                setTerminalCleared: handleAbort,
            },
            {
                type: TerminalWrapperType.REACT_SELECT,
                showDivider: true,
                classNamePrefix: 'containers-select',
                title: 'Container',
                placeholder: 'Select container',
                options: getGroupedContainerOptions(containers, true),
                value: selectedContainerName,
                onChange: handleContainerChange,
            },
            {
                type: TerminalWrapperType.REACT_SELECT,
                showDivider: true,
                classNamePrefix: 'terminal-select-shell',
                placeholder: 'Select Shell',
                options: shellTypes,
                defaultValue: shellTypes[0],
                onChange: handleShellChange,
                value: selectedTerminalType,
                styles: getShellSelectStyles(),
                components: {
                    IndicatorSeparator: null,
                    Option,
                },
            },
            {
                type: TerminalWrapperType.DOWNLOAD_FILE_FOLDER,
                hideTerminalStripComponent: false,
                isResourceBrowserView: !!isResourceBrowserView,
                isClusterTerminalView: false,
                containerName: selectedContainerName.value,
                appDetails,
            },
        ],
        tabSwitcher: {
            terminalData: {
                terminalRef,
                dataTestId: 'app-terminal-container',
                clearTerminal: terminalCleared,
                setSocketConnection,
                socketConnection,
                sessionId,
            },
        },
        metadata: isResourceBrowserView
            ? {
                  cluster: selectedResource.clusterName ?? '',
                  namespace: selectedResource.namespace ?? '',
                  pod: nodeName ?? '',
              }
            : {
                  app: appDetails.appName ?? '',
                  environment: appDetails.environmentName ?? '',
                  pod: nodeName ?? '',
              },
    }

    return (
        <div className={`${showTerminal ? '' : 'pod-terminal-hidden'}`}>
            <TerminalWrapper
                dataTestId="terminal-editor-header"
                selectionListData={selectionListData}
                socketConnection={socketConnection}
                setSocketConnection={setSocketConnection}
                isResourceBrowserView={isResourceBrowserView}
                className={isResourceBrowserView ? 'k8s-resource-view-container' : 'terminal-view-container'}
            />
        </div>
    )
}

export default TerminalComponent
