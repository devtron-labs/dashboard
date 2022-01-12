import React, { useEffect, useState } from 'react';
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json';
import { iLink } from '../../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab';
import { useParams, useRouteMatch } from 'react-router';
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getManifestResource } from '../nodeDetail.api';
import CodeEditor from '../../../../../CodeEditor/CodeEditor';
import IndexStore from '../../../index.store';
import { Progressing } from '../../../../../common';
import { ReactComponent as InfoIcon } from '../../../../assets/icons/ic-info-filled-gray.svg';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';
import { editor } from 'monaco-editor';

function ManifestComponent({ selectedTab, isDeleted }) {
    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON);
    const { url } = useRouteMatch();
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const [manifest, setManifest] = useState('');
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('');
    const [desiredManifest, setDesiredManifest] = useState('');
    const [diffMode, setDiffMode] = useState(false);
    const appDetails = IndexStore.getAppDetails();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        selectedTab(NodeDetailTab.MANIFEST, url);
        try {
            getManifestResource(appDetails, params.podName, params.nodeType)
                .then((response) => {
                    const _manifest = response?.result?.manifest;
                    if (_manifest) {
                        setManifest(_manifest);
                        setActiveManifestEditorData(_manifest);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    setError(true);
                    console.log('err', err);
                    setLoading(false);
                });
        } catch (err) {
            console.log('err', err);
        }
    }, [params.podName, params.nodeType]);

    //For External

    // const handleEditorValueChange = (codeEditorData: string) => {
    //     if (activeTab === 'Desired manifest') {
    //         setDesiredManifest(codeEditorData)
    //         setActiveManifestEditorData(codeEditorData)
    //         dispatch({
    //             type: TabActions.EnableTab,
    //             tabName: 'Compare',
    //         })
    //     }
    // }

    // const handleEditLiveManifest = () => {
    //     markActiveTab('Desired manifest')
    //     if (!desiredManifest) {
    //         setDesiredManifest(manifest)
    //         setActiveManifestEditorData(manifest)
    //     } else {
    //         setActiveManifestEditorData(desiredManifest)
    //     }
    // }

    // const markActiveTab = (_tabName: string) => {
    //     dispatch({
    //         type: TabActions.MarkActive,
    //         tabName: _tabName
    //     })
    // }

    // const updateEditor = (_tabName: string) => {
    //     switch (_tabName) {
    //         case 'Live Manifest':
    //             setDiffMode(false)
    //             setActiveManifestEditorData(manifest)
    //             break;
    //         case 'Compare':
    //             setDiffMode(true)
    //             setActiveManifestEditorData('')
    //             break;
    //         case 'Desired manifest':
    //             setDiffMode(false)
    //             setActiveManifestEditorData(desiredManifest)
    //             break;
    //     }

    // }

    // const handleTabClick = (_tab: iLink) => {
    //     if (_tab.isDisabled) {
    //         return
    //     }
    //     markActiveTab(_tab.name)
    //     updateEditor(_tab.name)
    // }

    // useEffect(() => {
    //     if (params.actionName) {
    //         markActiveTab(params.actionName)
    //     }
    // }, [params.actionName])
    editor.defineTheme('vs-dark--dt', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            //@ts-ignore
            { background: '#0B0F22' },
        ],
        colors: {
            'editor.background': '#0B0F22',
        },
    });

    return isDeleted ? (
        <div>
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <div style={{ minHeight: '600px', background: '#0B0F22', flex: 1 }}>
            {error && !loading && <MessageUI msg="Manifest not available" size={24} />}
            {!error && (
                <div>
                    <CodeEditor
                        theme="vs-dark--dt"
                        height={700}
                        value={manifest}
                        mode="yaml"
                        readOnly={true}
                        loading={loading}
                        customLoader={<MessageUI msg="fetching manifest" icon={MsgUIType.LOADING} size={24} />}
                        // readOnly={activeTab !== 'Desired manifest'}
                        // onChange={handleEditorValueChange}
                    ></CodeEditor>
                </div>
            )}
        </div>
    );

    // <>
    //     {loading && (
    //         <div className="flex bcn-0" style={{ minHeight: '600px' }}>
    //             <Progressing pageLoader />
    //         </div>
    //     )}
    //     {!activeManifestEditorData && (
    //         <div style={{ gridColumn: '1 / span 2' }} className="flex">
    //             <NoEvents title="Manifest not available" />
    //         </div>
    //     )}
    //     <div className="bcn-0">
    //         {/* <div className="flex left pl-20 pr-20 border-bottom">
    //         {
    //             tabs.map((tab: iLink, index) => {
    //                 return (
    //                     <div key={index + "tab"} className={` ${tab.isDisabled ? 'no-drop' : 'cursor'} pl-4 pt-8 pb-8 pr-4`}>
    //                         <div className={`${tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'} bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`} onClick={() => handleTabClick(tab)}>
    //                             {tab.name}
    //                         </div>
    //                     </div>
    //                 )
    //             })
    //         }
    //         <div className="pl-16 pr-16">|</div>
    //         <div className="flex left cb-5 cursor" onClick={handleEditLiveManifest}>
    //             <Edit className="icon-dim-16 pr-4 fc-5 " /> Edit Live Manifest
    //         </div>
    //     </div> */}
    //         {/* {
    //         diffMode ?
    //             <CodeEditor
    //                 original={manifest}
    //                 theme='vs-gray--dt'
    //                 height={600}
    //                 value={activeManifestEditorData}
    //                 mode="yaml"
    //                 readOnly={activeTab !== 'Desired manifest'}
    //             >
    //             </CodeEditor> : */}
    //         <CodeEditor
    //             theme="vs-gray--dt"
    //             height={600}
    //             value={activeManifestEditorData}
    //             mode="yaml"
    //             readOnly={true}
    //             // readOnly={activeTab !== 'Desired manifest'}
    //             // onChange={handleEditorValueChange}
    //         ></CodeEditor>
    //         {/* } */}
    //     </div>
    // </>
}

export default ManifestComponent;
