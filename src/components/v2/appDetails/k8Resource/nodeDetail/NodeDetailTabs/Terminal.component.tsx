import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnect.svg';
import { ReactComponent as Connect } from '../../../../assets/icons/ic-connect.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch } from 'react-router';
import { NodeDetailTab } from '../nodeDetail.type';
import './nodeDetailTab.scss';
import IndexStore from '../../../index.store';
import Select from 'react-select';
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization';
import { SocketConnectionType } from './node.type';
import TerminalView from './terminal/Terminal';
import MessageUI from '../../../../common/message.ui';
import { SingleSelectOption as Option } from '../../../../../common';

const shellTypes = [
    { label: 'sh', value: 'sh' },
    { label: 'bash', value: 'bash' },
    { label: 'powershell', value: 'powershell' },
    { label: 'cmd', value: 'cmd' },
];

function TerminalComponent({ selectedTab, isDeleted }) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const { url } = useRouteMatch();
    const containers = IndexStore.getAllContainersForPod(params.podName);
    const [logsPaused, toggleLogStream] = useState(false);
    const [selectedContainerName, setSelectedContainerName] = useState(containers[0]);
    const [selectedtTerminalType, setSelectedtTerminalType] = useState(shellTypes[0]);
    const [terminalCleared, setTerminalCleared] = useState(false);

    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>('CONNECTING');

    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL, url);
        // getTerminalData(appDetails, params.podName, selectedtTerminalType).then((response) => {
        //     console.log("getTerminalData", response)
        // }).catch((err) => {
        //     console.log("err", err)
        // })
    }, [params.podName]);

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.TERMINAL)
    // }, [])

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    return isDeleted ? (
        <div>
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <div className="terminal-view-container">
            <div className="flex left bcn-0 pt-4 pb-4 pl-20 border-top">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={
                        socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED' ? 'Disconnect' : 'Connect'
                    }
                >
                    {socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED' ? (
                        <span>
                            <Disconnect
                                className="icon-dim-20 mr-5"
                                onClick={(e) => {
                                    setSocketConnection('DISCONNECTING');
                                }}
                            />
                        </span>
                    ) : (
                        <span>
                            <Connect
                                className="icon-dim-20 mr-5"
                                onClick={(e) => {
                                    setSocketConnection('CONNECTING');
                                }}
                            />
                        </span>
                    )}
                </Tippy>

                <Tippy className="default-tt" arrow={false} placement="bottom" content={'Clear'}>
                    <div>
                        <Abort
                            className="icon-dim-20"
                            onClick={(e) => {
                                setTerminalCleared(true);
                            }}
                        />
                    </div>
                </Tippy>

                <span className="cn-2 mr-8 ml-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

                <div className="cn-6 ml-8 mr-10">Container </div>

                <div style={{ minWidth: '145px' }}>
                    <Select
                        placeholder="Select Containers"
                        options={
                            Array.isArray(containers)
                                ? containers.map((container) => ({ label: container, value: container }))
                                : []
                        }
                        defaultValue={{ label: selectedContainerName, value: selectedContainerName }}
                        onChange={(selected) => {
                            setSelectedContainerName((selected as any).value);
                            setTerminalCleared(true);
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
                            singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c', direction: 'rtl', marginLeft: 0 }),
                            indicatorsContainer: (provided, state) => ({
                                ...provided,
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                              color: 'var(--N900)',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              direction: 'rtl',
                              cursor: 'pointer',
                          }),
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                </div>

                <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

                <div style={{ minWidth: '145px' }}>
                    <Select
                        placeholder="Select Shell"
                        options={shellTypes}
                        defaultValue={shellTypes[0]}
                        onChange={(selected) => {
                            setSelectedtTerminalType(selected as any);
                            setTerminalCleared(true);
                            setSocketConnection('DISCONNECTING');
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
                            singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                            indicatorsContainer: (provided, state) => ({
                                ...provided,
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                              color: 'var(--N900)',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              direction: 'rtl',
                              cursor: 'pointer',
                          }),
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                </div>
            </div>

            <div className="terminal-view-wrapper">
                <TerminalView
                    nodeName={params.podName}
                    containerName={selectedContainerName}
                    socketConnection={socketConnection}
                    terminalCleared={terminalCleared}
                    shell={selectedtTerminalType}
                    setTerminalCleared={setTerminalCleared}
                    setSocketConnection={setSocketConnection}
                />
            </div>
        </div>
    );
}

export default TerminalComponent;
