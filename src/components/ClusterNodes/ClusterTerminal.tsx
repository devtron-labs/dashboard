import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import Select from 'react-select'
import { shellTypes } from '../../config/constants'
import { SocketConnectionType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/node.type'
import Terminal from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/Terminal'
import { clusterterminalDisconnect, clusterTerminalStart, clusterterminalUpdate } from './clusterNodes.service'
import { ReactComponent as Disconnect } from '../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import { Option } from '../../components/v2/common/ReactSelect.utils'
import { multiSelectStyles } from '../../components/v2/common/ReactSelectCustomization'
import { InputActionMeta } from 'react-select'
import { ReactComponent as Connect } from '../../assets/icons/ic-connected.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import CreatableSelect from 'react-select/creatable'

export default function ClusterTerminal({
    clusterId,
    clusterName,
    nodeList,
    closeTerminal,
}: {
    clusterId: number
    clusterName?: string
    nodeList: string[]
    closeTerminal?: () => void
}) {
    const [selectedContainerName, setSelectedContainerName] = useState({ label: nodeList[0], value: nodeList[0] })
    const [selectedtTerminalType, setSelectedtTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const [terminalAccessId, setTerminalId] = useState()
    const [selectedImage, setImage] = useState<string>('trstringer/internal-kubectl:latest')
    const [update, setUpdate] = useState<boolean>(false)
    const clusterNodeList = nodeList.map((node) => {
        return { label: node, value: node }
    })
    const payload = {
        clusterId: clusterId,
        baseImage: selectedImage,
        shellName: selectedtTerminalType.value,
        nodeName: selectedContainerName.value,
    }

    useEffect(() => {
        if (update) {
            clusterterminalUpdate({ ...payload, id: terminalAccessId }).then((response) => {
                setTerminalId(response.result.terminalAccessId)
            })
        } else {
            clusterTerminalStart(payload).then((response) => {
                setTerminalId(response.result.terminalAccessId)
                setUpdate(true)
            })
        }
        setSocketConnection(SocketConnectionType.CONNECTING)
    }, [clusterId, selectedtTerminalType.value, selectedContainerName.value, selectedImage])

    useEffect(() => {
        setTerminalCleared(true)
        setSelectedtTerminalType(shellTypes[0])
    }, [clusterId])

    // useEffect(() => {
    //     return () => {
    //         clusterterminalDisconnect(terminalAccessId)
    //     }
    // },[])

    const closeTerminalModal = () => {
        closeTerminal()
        clusterterminalDisconnect(terminalAccessId)
    }

    return (
        <div className="terminal-view-container">
            <div className="flex dc__content-space bcn-0 pl-20 dc__border-top">
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
                                ? 'Disconnect'
                                : 'Connect'
                        }
                    >
                        {socketConnection === SocketConnectionType.CONNECTING ||
                        socketConnection === SocketConnectionType.CONNECTED ? (
                            <span>
                                <Disconnect
                                    className="icon-dim-20 mr-5"
                                    onClick={(e) => {
                                        setSocketConnection(SocketConnectionType.DISCONNECTING)
                                    }}
                                />
                            </span>
                        ) : (
                            <span>
                                <Connect
                                    className="icon-dim-20 mr-5"
                                    onClick={(e) => {
                                        setSocketConnection(SocketConnectionType.CONNECTING)
                                    }}
                                />
                            </span>
                        )}
                    </Tippy>

                    <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                        <div>
                            <Abort
                                className="icon-dim-20"
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
                            onChange={(selected) => {
                                setSelectedContainerName(selected)
                                setTerminalCleared(true)
                            }}
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
                    <div className="cn-6 ml-8 mr-10">Shell </div>
                    <div>
                        <Select
                            placeholder="Select Shell"
                            options={shellTypes}
                            defaultValue={shellTypes[0]}
                            onChange={(selected) => {
                                setSelectedtTerminalType(selected as any)
                                setTerminalCleared(true)
                                setSocketConnection(SocketConnectionType.DISCONNECTING)
                            }}
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
                    <div className="cn-6 ml-8 mr-10">Image </div>
                    <div>
                        <CreatableSelect
                            placeholder="Select Image"
                            options={[
                                {
                                    value: 'trstringer/internal-kubectl:latest',
                                    label: 'trstringer/internal-kubectl:latest',
                                },
                            ]}
                            defaultValue={{
                                value: 'trstringer/internal-kubectl:latest',
                                label: 'trstringer/internal-kubectl:latest',
                            }}
                            onChange={(selected) => {
                                setImage(selected.value)
                                setTerminalCleared(true)
                                setSocketConnection(SocketConnectionType.DISCONNECTING)
                            }}
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
                <div>
                    <Close className="icon-dim-20 cursor mr-20" onClick={closeTerminalModal} />
                </div>
            </div>

            <div className="terminal-view-wrapper">
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
                />
            </div>
        </div>
    )
}
