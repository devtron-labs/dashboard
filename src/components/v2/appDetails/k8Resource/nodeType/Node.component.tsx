import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import IndexStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';
import { NodeType, Node, iNode } from '../../appDetails.type';
import './nodeType.scss'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util';

function NodeComponent() {
    const { path, url } = useRouteMatch();
    const [selectedNodes, setSelectedNodes] = useState<Array<iNode>>()
    const [selectedHealthyNodeCount, setSelectedHealthyNodeCount] = useState<Number>(0)
    const [copied, setCopied] = useState(false);
    const [tableHeader, setTableHeader] = useState([]);
    const [firstColWidth, setFirstColWidth] = useState("col-12");

    // const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const params = useParams<{ nodeType: NodeType }>()
    const [tabs, setTabs] = useState([])

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    useEffect(() => {

        if (params.nodeType) {
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            setTabs(_tabs)

            let tableHeader: Array<String>, _fcw: string;

            switch (params.nodeType) {
                case NodeType.Pod.toLowerCase():
                    tableHeader = ["Pod (All)", "Ready", "Restarts", "Age", "Status"]
                    _fcw = "col-8 pl-16"
                    break;
                case NodeType.Service.toLowerCase():
                    tableHeader = ["Name", "URL"]
                    _fcw = "col-6 pl-16"
                    break;
                default:
                    tableHeader = ["Name"]
                    _fcw = "col-12 pl-16"
                    break;
            }

            setTableHeader(tableHeader)
            setFirstColWidth(_fcw)

            let _selectedNodes = IndexStore.getNodesByKind(params.nodeType);//.filter((pn) => pn.kind.toLowerCase() === params.nodeType.toLowerCase())

            let _healthyNodeCount = 0

            console.log("nodeTreeDetails", _selectedNodes)

            _selectedNodes.forEach((node: Node) => {
                if (node.health?.status.toLowerCase() === "healthy") {
                    _healthyNodeCount++
                }
            })

            setSelectedNodes([..._selectedNodes])

            setSelectedHealthyNodeCount(_healthyNodeCount)
        }
    }, [params.nodeType])

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

    const makeNodeTree = (nodes: Array<iNode>) => {
        return nodes.map((node, index) => {
            return (
                <React.Fragment key={'grt' + index}>
                    <div className="resource-row row m-0 " onClick={() => {
                        setSelectedNodes(markNodeSelected(selectedNodes, node.name))
                    }} >
                        <div className={`${firstColWidth} pt-9 pb-9 cursor`} >
                            <div className="flex left top">
                                {(node.childNodes?.length > 0) ? <DropDown
                                    className={`rotate icon-dim-24 pointer ${node.isSelected ? 'fcn-9' : 'fcn-5'} `}
                                    style={{ ['--rotateBy' as any]: !node.isSelected ? '-90deg' : '0deg' }}
                                /> : <span className="pl-12 pr-12"></span>}

                                <div className="flexbox">
                                    <div>
                                        <div>{node.name}</div>
                                        <div className="cg-5">{node?.health?.status}</div>
                                    </div>
                                </div>

                                <div className="">
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
                                    {tabs && tabs.map((tab, index) => {
                                        return <NavLink  key={"tab__" + index} to={`${url}/${node.name}/${tab.toLowerCase()}`} className="fw-6  cb-5 ml-6 cursor">{tab}</NavLink>
                                    })}
                                </div>
                            </div>
                        </div>

                        {(params.nodeType === NodeType.Service.toLowerCase()) && <div className={"col-6 pt-9 pb-9 flex left"} >
                            {node.name + "." + node.namespace}  : portnumber
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                trigger='mouseenter click'
                            >
                                <Clipboard
                                    className="hover-only icon-dim-18 pointer"
                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                />
                            </Tippy>
                        </div>}

                        {params.nodeType === NodeType.Pod.toLowerCase() &&
                            <React.Fragment>
                                <div className={"col-1 pt-9 pb-9"} > ... </div>
                                <div className={"col-1 pt-9 pb-9"} > ... </div>
                                <div className={"col-1 pt-9 pb-9"} > ... </div>
                                <div className={"col-1 pt-9 pb-9"} > ... </div>
                            </React.Fragment>
                        }
                    </div>

                    {(node.childNodes?.length > 0 && node.isSelected) && makeNodeTree(node.childNodes)}
                </React.Fragment>
            )
        })
    }

    return (
        <div className="container-fluid generic-table ml-0 mr-0" style={{ paddingRight: 0, paddingLeft: 0 }}>
            {(params.nodeType === NodeType.Pod.toLowerCase()) ? <PodHeaderComponent /> :
                <div className="border-bottom  pt-10 pb-10" >
                    <div className="pl-16 fw-6 fs-14 text-capitalize">{params.nodeType}({selectedNodes?.length})</div>
                    <div className="pl-16"> {selectedHealthyNodeCount} healthy</div>
                </div>}

            <div className="row border-bottom fw-6 m-0">
                {
                    tableHeader.map((cell, index) => {
                        return <div key={'gpt_' + index} className={(`${index === 0 ? firstColWidth : 'col-1'} pt-9 pb-9`)}>{cell}</div>
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

