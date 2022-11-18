import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import Select from 'react-select'
import { shellTypes } from '../../config/constants'
import { SocketConnectionType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/node.type'
import Terminal from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/Terminal'
import { clusterDisconnectAndRetry, clusterterminalDisconnect, clusterTerminalStart, clusterTerminalStop, clusterterminalUpdate } from './clusterNodes.service'
import { ReactComponent as Disconnect } from '../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import { Option } from '../../components/v2/common/ReactSelect.utils'
import { multiSelectStyles } from '../../components/v2/common/ReactSelectCustomization'
import { InputActionMeta } from 'react-select'
import { ReactComponent as Connect } from '../../assets/icons/ic-connected.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Resize } from '../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as Play } from '../../assets/icons/ic-play.svg'
import CreatableSelect from 'react-select/creatable'
import { showError } from '../common'


export default function ClusterTerminal({
    clusterId,
    clusterName,
    nodeList,
    closeTerminal,
    clusterImageList,
    isNodeDetailsPage
}: {
    clusterId: number
    clusterName?: string
    nodeList: string[]
    closeTerminal?: () => void
    clusterImageList: string[]
    isNodeDetailsPage?: boolean
}) {
    const clusterNodeList = nodeList.map((node) => {
        return { label: node, value: node }
    })
    const imageList = clusterImageList.map((image) => {
        return { value: image, label: image }
    })

    
    const [selectedContainerName, setSelectedContainerName] = useState(clusterNodeList[0])
    const [selectedtTerminalType, setSelectedtTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [terminalAccessId, setTerminalId] = useState()
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const [selectedImage, setImage] = useState<string>(clusterImageList[0])
    const [update, setUpdate] = useState<boolean>(false)
    const [fullScreen, setFullScreen] = useState(false)

    const payload = {
        clusterId: clusterId,
        baseImage: selectedImage,
        shellName: selectedtTerminalType.value,
        nodeName: selectedContainerName.value,
    }

    useEffect(() => {
        if(update) {
            setSelectedContainerName(clusterNodeList[0])
        }
    },[clusterId, nodeList])
    
    useEffect(() => {
        try {
            if (update) {
                setTerminalCleared(true)
                clusterterminalUpdate({ ...payload, id: terminalAccessId }).then((response) => {
                    setTerminalId(response.result.terminalAccessId)
                    setSocketConnection(SocketConnectionType.CONNECTING)
                }).catch((error) => {
                    setSocketConnection(SocketConnectionType.DISCONNECTED)
                })
            } else {
                clusterTerminalStart(payload).then((response) => {
                    setTerminalId(response.result.terminalAccessId)
                    setUpdate(true)
                    socketConnecting()
                }).catch((error) => {
                    showError(error)
                    setSocketConnection(SocketConnectionType.DISCONNECTED)
                })
            }
        } catch (error) {
            showError(error)
            setUpdate(false)
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }, [selectedtTerminalType.value, selectedContainerName.value, selectedImage])
    

    // useEffect(() => {
    //     return () => {
    //         clusterterminalDisconnect(terminalAccessId)
    //     }
    // },[])


     async function closeTerminalModal(): Promise<void> {
        try {
            if(!isNodeDetailsPage){
                closeTerminal()
            }
            await clusterterminalDisconnect(terminalAccessId)
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        } catch (error) {
            showError(error)
        }
    }

    async function stopterminalConnection(): Promise<void> {
        try {
            await clusterTerminalStop(terminalAccessId)
        } catch (error) {
            showError(error)
        }
    }

    const socketConnecting = (): void => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const socketDiconnecting = (): void => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const onChangeNodes = (selected): void => {
        setSelectedContainerName(selected)
        setTerminalCleared(true)
        socketDiconnecting()
    }

    const onChangeTerminalType = (selected): void => {
        setSelectedtTerminalType(selected)
        setTerminalCleared(true)
        socketDiconnecting()
    }

    const onChangeImages = (selected): void => {
        setImage(selected.value)
        setTerminalCleared(true)
        socketDiconnecting()
    }

    const toggleScreenView = () => {
        setFullScreen(!fullScreen)
    }

    return (
        <div className={`${fullScreen || isNodeDetailsPage ? 'cluster-full_screen' : 'terminal-view-container'} ${isNodeDetailsPage ? '' : 'node-terminal'}`}>
            <div className="flex dc__content-space h-36 bcn-0 pl-20 dc__border-top">
                <div className="flex left">
                    {clusterName && (
                        <>
                            <div className="flex fw-6 fs-13 mr-20">{clusterName}</div>
                            <span className="bcn-2 mr-8" style={{ width: '1px', height: '36px' }} />
                        </>
                    )}

                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={
                            socketConnection === SocketConnectionType.CONNECTING ||
                            socketConnection === SocketConnectionType.CONNECTED
                                ? 'Stop'
                                : 'Resume'
                        }
                    >
                        {socketConnection === SocketConnectionType.CONNECTING ||
                        socketConnection === SocketConnectionType.CONNECTED ? (
                            <span className="mr-8 cursor">
                                <div className="icon-dim-12 mt-4 mr-4 mb-4 br-2 bcr-5" onClick={socketDiconnecting} />
                            </span>
                        ) : (
                            <span className="mr-8 flex">
                                <Play className="icon-dim-16 mr-4 cursor" onClick={socketConnecting} />
                            </span>
                        )}
                    </Tippy>
                    {isNodeDetailsPage && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={
                                socketConnection === SocketConnectionType.CONNECTING ||
                                socketConnection === SocketConnectionType.CONNECTED
                                    ? 'Disconnect'
                                    : 'Connect'
                            }
                        >
                            {socketConnection === SocketConnectionType.CONNECTING ||
                            socketConnection === SocketConnectionType.CONNECTED ? (
                                <span className="flex mr-8">
                                    <Disconnect className="icon-dim-16 mr-4" onClick={closeTerminalModal} />
                                </span>
                            ) : (
                                <span className="flex mr-8">
                                    <Connect className="icon-dim-16 mr-4" onClick={socketConnecting} />
                                </span>
                            )}
                        </Tippy>
                    )}

                    <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                        <div className="flex">
                            <Abort
                                className="icon-dim-16 mr-4"
                                onClick={(e) => {
                                    setTerminalCleared(true)
                                }}
                            />
                        </div>
                    </Tippy>

                    <span className="bcn-2 mr-8 ml-8" style={{ width: '1px', height: '16px' }} />

                    <div className="cn-6 ml-8 mr-10">Nodes </div>
                    <div style={{ minWidth: '145px' }}>
                        <Select
                            placeholder="Select Containers"
                            options={clusterNodeList}
                            defaultValue={selectedContainerName}
                            value={selectedContainerName}
                            onChange={onChangeNodes}
                            styles={{
                                ...multiSelectStyles,
                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
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
                                Option: (props) => <Option {...props} style={{ direction: 'rtl' }} />,
                            }}
                        />
                    </div>

                    <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                    <div className="cn-6 ml-8 mr-10">Image </div>
                    <div>
                        <CreatableSelect
                            placeholder="Select Image"
                            options={imageList}
                            defaultValue={imageList[0]}
                            onChange={onChangeImages}
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
                                singleValue: (base, state) => ({
                                    ...base,
                                    fontWeight: 600,
                                    textAlign: 'left',
                                    color: '#06c',
                                }),
                                indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    </div>
                    <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                    <div className="cn-6 ml-8 mr-10">Shell </div>
                    <div>
                        <Select
                            placeholder="Select Shell"
                            options={shellTypes}
                            defaultValue={shellTypes[0]}
                            onChange={onChangeTerminalType}
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
                                singleValue: (base, state) => ({
                                    ...base,
                                    fontWeight: 600,
                                    textAlign: 'left',
                                    color: '#06c',
                                }),
                                indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    </div>
                </div>
                {!isNodeDetailsPage && (<span className='flex'>
                    <Resize className='mr-12 cursor' onClick={toggleScreenView} />
                    <Close className="icon-dim-20 cursor mr-20" onClick={closeTerminalModal} />
                </span>)}
            </div>

            <div className={`${fullScreen || isNodeDetailsPage ? 'full-screen' : ''} cluster-terminal__wrapper ${isNodeDetailsPage ? 'node-terminal-wrapper' : ''}`}>
                <Terminal
                    nodeName={selectedContainerName.label}
                    containerName={selectedContainerName.label}
                    socketConnection={socketConnection}
                    terminalCleared={terminalCleared}
                    shell={selectedtTerminalType}
                    setTerminalCleared={setTerminalCleared}
                    setSocketConnection={setSocketConnection}
                    clusterTerminal={true}
                    terminalId={terminalAccessId}
                    stopterminalConnection={stopterminalConnection}
                />
            </div>
        </div>
    )
}
