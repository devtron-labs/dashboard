import React, { Children, useEffect, useState } from 'react'
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';
import { useHistory, useRouteMatch, useParams } from "react-router";
import { NavLink } from 'react-router-dom';
import IndexStore from '../../index.store';
import { useSharedState } from '../../../utils/useSharedState';
import { getAggregator, iNode, iNodes, NodeType } from '../../appDetails.type';
import AppDetailsStore from '../../appDetails.store';
import { URLS } from '../../../../../config';
import { ReactComponent as ErrorImage } from '../../../../../assets/icons/misc/errorInfo.svg';
import { getNodeStatus } from './nodeType.util';


function NodeTreeComponent() {
    const { url, path } = useRouteMatch();
    const history = useHistory();
    const [k8URL, setK8URL] = useState("")

    const [{ treeNodes }, dispatch] = useNodeTree();
    const [filteredNodes] = useSharedState(IndexStore.getAppDetailsFilteredNodes(), IndexStore.getAppDetailsNodesFilteredObservable())
    const params = useParams<{ nodeType: NodeType }>()

    const handleNodeClick = (treeNode: iNode, parentNode: iNode, e: any) => {
        if (e) { e.stopPropagation() }

        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.ParentNodeClick,
                selectedNode: treeNode,
            })

            AppDetailsStore.setNodeTreeActiveParentNode(treeNode)
        } else {
            dispatch({
                type: NodeTreeActions.ChildNodeClick,
                selectedNode: treeNode,
                parentNode: parentNode
            })

            AppDetailsStore.setNodeTreeActiveParentNode(parentNode)
            AppDetailsStore.setNodeTreeActiveNode(treeNode)
        }
    }

    const _navigate = (nodeToBeSelected) => {
        let _url = url

        if (!params.nodeType) {
            _url = `${url}/${nodeToBeSelected.name.toLowerCase()}`;
        }

        history.push(_url);
    }

    const getPNodeName = (_string: string) => {
        return getAggregator((_string.charAt(0).toUpperCase() + _string.slice(1)) as NodeType);
    }

    useEffect(() => {
        if (!treeNodes || treeNodes.length === 0) return

        let activeParentNode = AppDetailsStore.getNodeTreeActiveParentNode()
        let activeNode = AppDetailsStore.getNodeTreeActiveNode()

        if (!activeParentNode) {
            const _urlArray = window.location.href.split(URLS.APP_DETAILS_K8 + "/")

            if (_urlArray?.length === 2) {
                const _kind = _urlArray[1].split("/")[0]

                const _nodesByKind = IndexStore.getiNodesByKind(_kind)
                if (_nodesByKind && _nodesByKind.length > 0) {
                    activeParentNode = {
                        name: getPNodeName(_kind),
                        childNodes: [{
                            name: _nodesByKind[0].kind,
                            status: getNodeStatus(_nodesByKind[0])
                        }]
                    } as iNode
                }
            } else {

                const pods = IndexStore.getiNodesByKind(NodeType.Pod)

                if (pods.length > 0) {
                    activeParentNode = {
                        name: getPNodeName(NodeType.Pod),
                        childNodes: [{
                            name: pods[0].kind
                        }]
                    } as iNode
                }
            }
        }

        activeParentNode = activeParentNode || treeNodes[0]
        activeNode = activeNode || activeParentNode.childNodes[0]

        _navigate(activeNode)

        setTimeout(() => {
            handleNodeClick(activeParentNode, null, null)
            handleNodeClick(activeNode, activeParentNode, null)
        }, 100)

    }, [treeNodes.length])

    useEffect(() => {
        dispatch({
            type: NodeTreeActions.Init,
            nodes: filteredNodes,
        })

        const _arr = url.split(URLS.APP_DETAILS_K8)

        setK8URL(_arr[0] + URLS.APP_DETAILS_K8)

    }, [filteredNodes.length])

    const makeNodeTree = (treeNodes: iNodes, parentNode?: iNode) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name} >
                    <div className={`flex left cursor fw-6 cn-9 fs-14 `} onClick={(e) => handleNodeClick(treeNode, parentNode, e)}>

                        {treeNode.childNodes?.length > 0 ?
                            <React.Fragment>
                                <DropDown
                                    className={`${treeNode.isSelected ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                                />
                                <div className={`fs-14 fw-6 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-20 `}>
                                    {treeNode.name}
                                </div>
                                {/* {appDe?.nodeStatusCount[kind]?.Degraded > 0 && (
                                    <ErrorImage
                                        className="icon-dim-16 rotate"
                                        style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                                    /> */}
                                {/* )} */}
                            </React.Fragment>
                            :

                            <NavLink to={`${k8URL}/${treeNode.name.toLowerCase()}`} className={`no-decor fs-14 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-1-43 ${(treeNode.isSelected) ? 'bcb-1 cb-5' : 'cn-7 resource-tree__nodes '}`}>
                                {treeNode.name}
                            </NavLink>
                        }
                    </div>

                    {(treeNode.childNodes?.length > 0 && treeNode.isSelected) &&
                        <div className={`pl-24`}>{makeNodeTree(treeNode.childNodes, treeNode)} </div>
                    }
                </div>
            )
        })
    }

    return (
        <div>
            {treeNodes && treeNodes.length > 0 && makeNodeTree(treeNodes)}
        </div>
    )
}

export default NodeTreeComponent
