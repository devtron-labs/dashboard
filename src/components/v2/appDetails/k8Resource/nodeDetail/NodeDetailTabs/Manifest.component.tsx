import React, { useEffect, useState } from 'react'
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

function ManifestComponent({ selectedTab }) {

    const [{ tabs, activeTab }, dispatch] = useTab(ManifestTabJSON);
    const { url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const [manifest, setManifest] = useState("...");
    const [activeManifestEditorData, setActiveManifestEditorData] = useState('');
    const [desiredManifest, setDesiredManifest] = useState('');
    const [diffMode, setDiffMode] = useState(false)

    useEffect(() => {
        selectedTab(NodeDetailTab.MANIFEST)

        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.podName, url)
        }

        const appDetails = IndexStore.getAppDetails();

        getManifestResource(appDetails, params.podName).then((response) => {
            setManifest(response.result.manifest)
            setActiveManifestEditorData(response.result.manifest)
        }).catch((err) => {
            console.log("err", err)
        })

    }, [params.podName])

    const handleEditorValueChange = (codeEditorData: string) => {
        if (activeTab === 'Desired manifest') {
            setDesiredManifest(codeEditorData)
            setActiveManifestEditorData(codeEditorData)
            dispatch({
                type: TabActions.EnableTab,
                tabName: 'Compare',
            })
        }
    }

    const handleEditLiveManifest = () => {
        markActiveTab('Desired manifest')
        if (!desiredManifest) {
            setDesiredManifest(manifest)
            setActiveManifestEditorData(manifest)
        } else {
            setActiveManifestEditorData(desiredManifest)
        }
    }

    const markActiveTab = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })
    }

    const updateEditor = (_tabName: string) => {
        switch (_tabName) {
            case 'Live Manifest':
                setDiffMode(false)
                setActiveManifestEditorData(manifest)
                break;
            case 'Compare':
                setDiffMode(true)
                setActiveManifestEditorData('')
                break;
            case 'Desired manifest':
                setDiffMode(false)
                setActiveManifestEditorData(desiredManifest)
                break;
        }

    }

    const handleTabClick = (_tab: iLink) => {
        if (_tab.isDisabled) {
            return
        }
        markActiveTab(_tab.name)
        updateEditor(_tab.name)
    }

    useEffect(() => {
        if (params.actionName) {
            markActiveTab(params.actionName)
        }
    }, [params.actionName])


    return (
        <div className="bcn-0">
            <div className="flex left pl-20 pr-20 border-bottom">
                {
                    tabs.map((tab: iLink, index) => {
                        return (
                            <div key={index + "tab"} className={` ${tab.isDisabled ? 'no-drop' : 'cursor'} pl-4 pt-8 pb-8 pr-4`}>
                                <div className={`${tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'} bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`} onClick={() => handleTabClick(tab)}>
                                    {tab.name}
                                </div>
                            </div>
                        )
                    })
                }
                <div className="pl-16 pr-16">|</div>
                <div className="flex left cb-5 cursor" onClick={handleEditLiveManifest}>
                    <Edit className="icon-dim-16 pr-4 fc-5 " /> Edit Live Manifest
                </div>
            </div>
            {
                diffMode ?
                    <CodeEditor
                        original={manifest}
                        theme='vs-gray--dt'
                        height={500}
                        value={activeManifestEditorData}
                        mode="yaml"
                        readOnly={activeTab !== 'Desired manifest'}
                    >
                    </CodeEditor> :
                    <CodeEditor
                        theme='vs-gray--dt'
                        height={500}
                        value={activeManifestEditorData}
                        mode="yaml"
                        readOnly={activeTab !== 'Desired manifest'}
                        onChange={handleEditorValueChange}
                    >
                    </CodeEditor>
            }
        </div>
    )
}

export default ManifestComponent


