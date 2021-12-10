import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnect.svg';
import { ReactComponent as Connect } from '../../../../assets/icons/ic-connect.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch } from 'react-router';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import './nodeDetailTab.scss'
import IndexStore from '../../../index.store';
import { TerminalView } from './terminal/TerminalViewWrapper';
import Select from 'react-select';
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization'

export type SocketConnectionType = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'DISCONNECTING';

function TerminalComponent({ selectedTab }) {
    const { url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const appDetails = IndexStore.getAppDetails()
    const containers = IndexStore.getMetaDataForPod(params.podName).containers
    const [logsPaused, toggleLogStream] = useState(false);
    const [selectedContainerName, setSelectedContainerName] = useState(containers[0]);
    const [selectedtTerminalType, setSelectedtTerminalType] = useState({ label: "sh", value: "sh" });
    const [terminalCleared, setTerminalCleared] = useState(false);
    const [isReconnection, setIsReconnection] = useState(false);

    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>("CONNECTING")


    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL)
        // getTerminalData(appDetails, params.podName, selectedtTerminalType).then((response) => {
        //     console.log("getTerminalData", response)
        // }).catch((err) => {
        //     console.log("err", err)
        // })

    }, [params.podName])

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.TERMINAL)
    // }, [])

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    let isSocketConnecting = socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED';

    return (<div>
        <div className="flex left bcn-0 pt-8 pl-20">
            <Tippy
                className="default-tt"
                arrow={false}
                placement="bottom"
                content={isSocketConnecting ? 'Disconnect' : 'Connect'}
            >
                {isSocketConnecting ?
                    <span>
                        <Disconnect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('DISCONNECTING'); setIsReconnection(true); }} />
                    </span>
                    : <span>
                        <Connect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('CONNECTING') }} />
                    </span>
                }
            </Tippy>


            <Tippy className="default-tt"
                arrow={false}
                placement="bottom"
                content={'Clear'} >
                <div>
                    <Abort className="icon-dim-20" onClick={(e) => { setTerminalCleared(true); }} />
                </div>
            </Tippy>

            <span className="cn-2 mr-8 ml-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

            <div className="cn-6">Container </div>

            <div style={{ minWidth: '145px' }}>
                <Select
                    className="bw-0 pl-8"
                    options={Array.isArray(containers) ? containers.map(container => ({ label: container, value: container })) : []}
                    placeholder='All Containers'
                    value={{ label: selectedContainerName, value: selectedContainerName }}
                    onChange={(selected, meta) => setSelectedContainerName((selected as any).value)}
                    closeMenuOnSelect
                    // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent', minHeight: '24px !important' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                        indicatorsContainer: (provided, state) => ({
                            ...provided,
                            height: '24px',
                        }),
                    }}
                    isSearchable={false}
                />
            </div>

            <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />


            <div className="cn-6">sh </div>
            <div style={{ minWidth: '145px' }}>
                <Select
                    className="br-4 pl-8 bw-0"
                    options={Array.isArray(containers) ? containers.map(container => ({ label: container, value: container })) : []}
                    placeholder='All Containers'
                    value={{ label: selectedContainerName, value: selectedContainerName }}
                    onChange={(selected, meta) => setSelectedContainerName((selected as any).value)}
                    closeMenuOnSelect
                    // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: '0px', backgroundColor: 'transparent', minHeight: '24px !important' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                        indicatorsContainer: (provided, state) => ({
                            ...provided,
                            height: '24px',
                        }),
                    }}
                    isSearchable={false}
                />
            </div>

        </div>

        <div style={{ height: '460px', background: 'black' }}>
            <TerminalView appDetails={appDetails}
                nodeName={params.podName}
                containerName={selectedContainerName}
                socketConnection={socketConnection}
                terminalCleared={terminalCleared}
                shell={selectedtTerminalType}
                isReconnection={isReconnection}
                setIsReconnection={setIsReconnection}
                setTerminalCleared={setTerminalCleared}
                setSocketConnection={setSocketConnection}
            />

        </div>
    </div>
    )
}

export default TerminalComponent
