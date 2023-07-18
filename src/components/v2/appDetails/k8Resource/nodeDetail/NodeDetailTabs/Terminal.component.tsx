import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab, ResponsePayload } from '../nodeDetail.type'
import IndexStore from '../../../index.store'
import MessageUI from '../../../../common/message.ui'
import { getCustomOptionSelectionStyle } from '../../../../common/ReactSelect.utils'
import {
    getContainerSelectStyles,
    getGroupedContainerOptions,
    getShellSelectStyles,
} from '../nodeDetail.util'
import { shellTypes } from '../../../../../../config/constants'
import { OptionType } from '../../../../../app/types'
import {AppType, TerminalComponentProps, Options} from '../../../appDetails.type'
import './nodeDetailTab.scss'
import TerminalWrapper from './terminal/TerminalWrapper.component'
import {TerminalSelectionListDataType} from './terminal/terminal.type'
import {get, showError, stopPropagation} from '@devtron-labs/devtron-fe-common-lib'
import {SocketConnectionType} from '../../../../../ClusterNodes/constants'
import {TerminalWrapperType} from './terminal/constants'
import {getAppId, generateDevtronAppIdentiferForK8sRequest, deleteEphemeralUrl} from '../nodeDetail.api'
import {toast} from 'react-toastify'
import {components} from 'react-select'
import {ReactComponent as Cross} from '../../../../../../assets/icons/ic-cross.svg'
import Tippy from '@tippyjs/react'

let clusterTimeOut

function TerminalComponent({
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
    selectedNamespaceByClickingPod,
    setContainers,
}: TerminalComponentProps) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string, clusterId?: string }>()
    const { url } = useRouteMatch()
    const terminalRef = useRef(null)
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const selectedContainerValue = isResourceBrowserView ? selectedResource?.name : podMetaData?.name
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedTerminalType, setSelectedTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const defaultContainerOption = { label: selectedContainerName, value: selectedContainerName }
    const [sessionId, setSessionId] = useState<string>()
    const connectTerminal: boolean =
        socketConnection === SocketConnectionType.CONNECTING || socketConnection === SocketConnectionType.CONNECTED
    const appDetails = IndexStore.getAppDetails()
    const nodeName = isResourceBrowserView ? params.node : params.podName

    function Option(props) {
      const { selectProps, data, style } = props
      const getPayload = (containerName: string) => {
        let payload: ResponsePayload = {
          namespace: isResourceBrowserView
          ? selectedNamespaceByClickingPod
          : appDetails.namespace,
      clusterId: isResourceBrowserView ? Number(params.clusterId) : appDetails.clusterId,
      podName: isResourceBrowserView ? params.node : params.podName,
            basicData: {
                containerName: containerName,
            },
        }
        return payload
    }

      const deleteEphemeralContainer = (containerName: string) => {
          deleteEphemeralUrl(
              getPayload(containerName),
              appDetails.clusterId,
              appDetails.environmentId,
              appDetails.namespace,
              appDetails.appName,
              appDetails.appId,
              appDetails.appType,
              isResourceBrowserView,
              params
          )
              .then((response: any) => {
                  const _containers : Options[] = []
                  let containerName = response.result
                    containers?.forEach((con) => {
                      if (containerName !== con.name) {
                          _containers.push(con)
                      }
                  })
                  switchSelectedContainer(containers?.[0]?.name || '')
                  setContainers(_containers)
                  toast.success('Deleted successfully')
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
                                  content="Remove container"
                              >
                                  <Cross
                                      className={`icon-dim-16 cursor ${props.isFocused ? 'scr-5' : ''}`}
                                      onClick={(selected) => {
                                          deleteEphemeralContainer(props.label)
                                      }}
                                  />
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
                ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
                : getAppId(
                      appDetails.clusterId,
                      appDetails.namespace,
                      appDetails.appName,
                  )

        let url: string = 'k8s/pod/exec/session/'
        if (isResourceBrowserView) {
            url += `${selectedResource.clusterId}`
        } else {
            url += `${appId}`
        }
        url += `/${isResourceBrowserView ? selectedResource.namespace : appDetails.namespace}/${nodeName}/${
            selectedTerminalType.value
        }/${selectedContainerName}`
        if (!isResourceBrowserView) {
            return url+`?appType=${appDetails.appType === AppType.DEVTRON_APP ? '0' : '1'}`
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
    }, [params.podName, params.node])

    useEffect(() => {
        setSelectedContainerName(_selectedContainer)
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
        }
    }, [selectedTerminalType, selectedContainerName])

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
        setSelectedContainerName(selected.value)
        setSelectedContainer(selectedContainer.set(selectedContainerValue, selected.value))
    }

    const handleShellChange = (selected: OptionType) => {
        setSelectedTerminalType(selected)
    }

    if (isDeleted || !selectedContainerName.length) {
        return (
            <div>
                <MessageUI
                    msg="This resource no longer exists"
                    size={32}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
                />
            </div>
        )
    }

    const selectionListData: TerminalSelectionListDataType = {
        firstRow: [
            {
                type: TerminalWrapperType.CONNECTION_BUTTON,
                connectTerminal: connectTerminal,
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
                value: defaultContainerOption,
                onChange: handleContainerChange,
                styles: getContainerSelectStyles(),
                components: {
                    IndicatorSeparator: null,
                    Option: (props) => <Option {...props} style={{ direction: 'rtl' }} />,
                },
            },
            {
                type: TerminalWrapperType.REACT_SELECT,
                showDivider: true,
                classNamePrefix: 'terminal-select-shell',
                placeholder: 'Select Shell',
                options: shellTypes,
                defaultValue: shellTypes[0],
                onChange: handleShellChange,
                styles: getShellSelectStyles(),
                components: {
                    IndicatorSeparator: null,
                    Option,
                },
            },
        ],
        tabSwitcher: {
            terminalData: {
                terminalRef: terminalRef,
                dataTestId: 'app-terminal-container',
                clearTerminal: terminalCleared,
                setSocketConnection: setSocketConnection,
                socketConnection: socketConnection,
                sessionId: sessionId,
            },
        },
    }

    return (
        <TerminalWrapper
            dataTestId="terminal-editor-header"
            selectionListData={selectionListData}
            socketConnection={socketConnection}
            setSocketConnection={setSocketConnection}
            className={isResourceBrowserView ? 'k8s-resource-view-container' : 'terminal-view-container'}
        />
    )
}

export default TerminalComponent
