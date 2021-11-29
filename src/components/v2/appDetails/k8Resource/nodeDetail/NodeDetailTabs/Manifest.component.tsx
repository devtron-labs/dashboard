import React, { useEffect, useState } from 'react'
import CodeEditor from '../../../../../CodeEditor/CodeEditor';
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json';
import { iLink } from '../../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab';
import { useParams, useRouteMatch } from 'react-router';

import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTabs } from '../../../node.type';
import { getManifestResource } from '../nodeDetail.api';

function ManifestComponent({selectedTab}) {
    
    const [{ tabs }, dispatch] = useTab(ManifestTabJSON);
    const { path, url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string }>()
    const [manifest, setManifest] = useState("...");

    useEffect(() => {
        selectedTab(NodeDetailTabs.MANIFEST)

        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.podName, url)
        }

        getManifestResource().then((response) => {
            setManifest(response.result.manifest)
        }).catch((err) => {
            console.log("err", err)
        })

    }, [params.podName])

    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })
    }

    useEffect(() => {
        if(params.actionName){
            handleTabClick(params.actionName)
        }
    }, [params.actionName])
    

    return (
        <div className="bcn-0">
            <div className="flex left pl-20 pr-20 border-bottom">
                {
                    tabs.map((tab: iLink, index) => {
                        return (
                            <div key={index + "tab"} className={`cursor pl-4 pt-8 pb-8 pr-4`}>
                                <div className={`${tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'} bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`} onClick={() => handleTabClick(tab.name)}>
                                    {tab.name}
                                </div>
                            </div>
                        )
                    })
                }
                <div className="pl-16 pr-16">|</div>
                <div className="flex left cb-5">
                    <Edit className="icon-dim-16 pr-4 fc-5" /> Edit Live Manifest
                </div>
            </div>
            <CodeEditor
                theme='vs-gray--dt'
                height={500}
                value={manifest}
                mode="yaml"
            // onChange={(event) => { this.handleConfigChange(event) }}
            >
            </CodeEditor>
        </div>
    )
}

export default ManifestComponent


