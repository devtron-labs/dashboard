import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch, useParams, useHistory } from 'react-router';
import IndexStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';
import { NodeType, Node, iNode } from '../../appDetails.type';
import './nodeType.scss'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util';
import NodeDeleteComponent from './NodeDelete.component';
import AppDetailsStore from '../../appDetails.store';
import { toast } from 'react-toastify';
import { NodeDetailTab } from '../nodeDetail/nodeDetail.type';

function NodeComponent() {
    const { path, url } = useRouteMatch();
    const history = useHistory()
    const [selectedNodes, setSelectedNodes] = useState<Array<iNode>>()
    const [selectedHealthyNodeCount, setSelectedHealthyNodeCount] = useState<Number>(0)
    const [copied, setCopied] = useState(false);
    const [tableHeader, setTableHeader] = useState([]);
    const [firstColWidth, setFirstColWidth] = useState("");
    const [podType, setPodType] = useState(false)
    const [detailedNode, setDetailedNode] = useState<{ name: string; containerName?: string }>(null);
    const appDetails = IndexStore.getAppDetails()
    // const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const params = useParams<{ nodeType: NodeType }>()
    // const [tabs, setTabs] = useState([])

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    useEffect(() => {
        if (params.nodeType) {
            // const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            // setTabs(_tabs)

            let tableHeader: Array<String>, _fcw: string;

            switch (params.nodeType) {
                case NodeType.Pod.toLowerCase():
                    tableHeader = ["Pod (All)", "Ready", ""]
                    _fcw = "col-10"
                    break;
                case NodeType.Service.toLowerCase():
                    tableHeader = ["Name", "URL", ""]
                    _fcw = "col-6"
                    break;
                default:
                    tableHeader = ["Name", ""]
                    _fcw = "col-11"
                    break;
            }

            setTableHeader(tableHeader)
            setFirstColWidth(_fcw)

            let _selectedNodes = IndexStore.getiNodesByKind(params.nodeType);//.filter((pn) => pn.kind.toLowerCase() === params.nodeType.toLowerCase())

            if (params.nodeType.toLowerCase() === NodeType.Pod.toLowerCase()) {
                _selectedNodes = _selectedNodes.filter((node) => {
                    const _podMetaData = IndexStore.getMetaDataForPod(node.name)

                    return _podMetaData.isNew === podType

                })
            }
            let _healthyNodeCount = 0

            _selectedNodes.forEach((node: Node) => {
                if (node.health?.status.toLowerCase() === "healthy") {
                    _healthyNodeCount++
                }
            })

            setSelectedNodes([..._selectedNodes])

            setSelectedHealthyNodeCount(_healthyNodeCount)
        }
    }, [params.nodeType, podType])

    const markNodeSelected = (nodes: Array<iNode>, nodeName: string) => {
        const updatedNodes = nodes.map(node => {
            if (node.name === nodeName) {
                node.isSelected = !node.isSelected
            } else if (node.childNodes?.length > 0) {
                markNodeSelected(node.childNodes, nodeName)
            }

            return node
        })

        return updatedNodes
    }

    const describeNode = (name: string, containerName: string) => {
        setDetailedNode({ name, containerName });
    }

    const handleActionTabClick = (node: iNode, _tabName: string, containerName?: string) => {
        let _url = `${url.split("/").slice(0, -1).join("/")}/${node.kind.toLowerCase()}/${node.name}/${_tabName.toLowerCase()}`
        if (containerName) {
            _url = `${_url}?container=${containerName}`
        }
        const isAdded = AppDetailsStore.addAppDetailsTab(node.kind, node.name, _url)
        if (isAdded) {
            history.push(_url)
        } else {
            toast.error(<div>
                <div>Max 5 tabs allowed</div>
                <p>Please close an open tab and try again.</p>
            </div>)
        }
    }

    const makeNodeTree = (nodes: Array<iNode>, showHeader?: boolean) => {
        return nodes.map((node, index) => {
            return (
                <React.Fragment key={'grt' + index}>
                    {showHeader && <div className="fw-6 pt-10 pb-10 pl-16 border-bottom">
                        <span >{node.kind}</span>
                    </div>}
                    <div className="row m-0 resource-row"  >
                        <div className={`resource-row__content ${firstColWidth} pt-9 pb-9 cursor`} >
                            <div className="flex left top ml-2" onClick={() => { setSelectedNodes(markNodeSelected(selectedNodes, node.name)) }}>
                                {(node.childNodes?.length > 0) ?
                                    <DropDown
                                        className={`rotate icon-dim-24 pointer ${node.isSelected ? 'fcn-9' : 'fcn-5'} `}
                                        style={{ ['--rotateBy' as any]: !node.isSelected ? '-90deg' : '0deg' }}
                                    /> : <span className="pl-12 pr-12"></span>}
                                <div>
                                    <div>{node.name}</div>
                                    <div className="cg-5">{node.health?.status}</div>
                                </div>

                                <div>
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="bottom"
                                        content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                        trigger='mouseenter click'
                                    >
                                        <Clipboard
                                            className="resource-action-tabs__active icon-dim-12 pointer ml-8 mr-8"
                                            onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                        />
                                    </Tippy>
                                    {getNodeDetailTabs(node.kind).map((tab, index) => {
                                        return <a key={"tab__" + index} onClick={() => handleActionTabClick(node, tab)} className="fw-6 cb-5 ml-6 cursor resource-action-tabs__active">
                                            {tab}
                                        </a>
                                    })}
                                </div>

                            </div>
                        </div>

                        {(params.nodeType === NodeType.Service.toLowerCase()) && <div className={"col-5 pt-9 pb-9 flex left"} >
                            {node.name + "." + node.namespace}  : <span className='ml-4'>{` { portnumber }`}</span>
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                trigger='mouseenter click'
                            >
                                <Clipboard
                                    className="resource-action-tabs__active pl-4 icon-dim-16 pointer"
                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                />
                            </Tippy>
                        </div>}

                        {params.nodeType === NodeType.Pod.toLowerCase() &&
                            <div className={"col-1 pt-9 pb-9"} > 1/1 </div>
                        }

                        <div className={"col-1 pt-9 pb-9 d-flex flex-row-reverse"} >
                            <NodeDeleteComponent 
                            nodeDetails={node}
                            describeNode={describeNode}
                            appName={appDetails.appName}
                            environmentName={appDetails.environmentName}
                            // key={column}
                            appId={appDetails.appId}
                        />
                        </div>

                    </div>

                    {(node.childNodes?.length > 0 && node.isSelected) ?
                        <div className="ml-22 indent-line">
                            <div>{makeNodeTree(node.childNodes, true)}</div>
                        </div>
                        :
                        <React.Fragment>
                            {node.kind === NodeType.Pod &&
                                <div className="col-12 pl-16 pt-9 pb-9 ">
                                    <div className="fw-6 pt-10 pb-10 pl-32 border-bottom">Containers</div>
                                    {IndexStore.getMetaDataForPod(node.name).containers.map((container, index) => {
                                        return <div key={`container_${index}`} className="flex left resource-row">
                                            <div className="resource-row__content pl-32 pt-9 pb-9 cursor">{container}</div>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                                trigger='mouseenter click'
                                            >
                                                <Clipboard
                                                    className="resource-action-tabs__active pl-4 icon-dim-16 pointer"
                                                    onClick={(e) => copyToClipboard(container, () => setCopied(true))}
                                                />
                                            </Tippy>
                                            <a onClick={() => handleActionTabClick(node, NodeDetailTab.LOGS, container)} className="fw-6 cb-5 ml-6 cursor resource-action-tabs__active">
                                                {NodeDetailTab.LOGS}
                                            </a>
                                        </div>
                                    })}


                                </div>}
                        </React.Fragment>
                    }

                </React.Fragment>
            )
        })
    }

    return (
        <div className="container-fluid" style={{ paddingRight: 0, paddingLeft: 0 }}>
            {(params.nodeType === NodeType.Pod.toLowerCase()) ? <PodHeaderComponent callBack={setPodType} /> :
                <div className="border-bottom  pt-10 pb-10" >
                    <div className="pl-16 fw-6 fs-14 text-capitalize">
                        <span className="pr-4">{selectedNodes && selectedNodes[0]?.kind}</span>
                        <span>({selectedNodes?.length})</span>
                    </div>
                    {selectedHealthyNodeCount > 0 && <div className="pl-16"> {selectedHealthyNodeCount} healthy</div>}
                </div>}

            <div className="row border-bottom fw-6 m-0">
                {
                    tableHeader.map((cell, index) => {
                        return <div key={'gpt_' + index} className={(`${index === 0 ? `node-row__pdding ${firstColWidth}` : 'col-1'} pt-9 pb-9`)}>{cell}</div>
                    })
                }
            </div>

            {
                selectedNodes && makeNodeTree(selectedNodes)
            }
        </div>
    )
}

export default NodeComponent

