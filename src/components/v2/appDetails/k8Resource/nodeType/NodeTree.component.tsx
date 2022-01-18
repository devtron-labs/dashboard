import React, { Children, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { getTreeNodesWithChild, NodeTreeActions, useNodeTree } from './useNodeTreeReducer';
import { useHistory, useRouteMatch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import IndexStore from '../../index.store';
import { useSharedState } from '../../../utils/useSharedState';
import { AggregationKeys, getAggregator, iNode, iNodes, NodeType } from '../../appDetails.type';
import AppDetailsStore from '../../appDetails.store';
import { URLS } from '../../../../../config';
import { ReactComponent as ErrorImage } from '../../../../../assets/icons/misc/errorInfo.svg';
import { getNodeStatus } from './nodeType.util';
import { string } from 'prop-types';

function NodeTreeComponent({clickedNodes, registerNodeClick}: {clickedNodes: Map<string, string>, registerNodeClick: Dispatch<SetStateAction<Map<string, string>>>}) {
    const { url, path } = useRouteMatch();
    const history = useHistory();
    const [k8URL, setK8URL] = useState('');

    const [{ treeNodes }, dispatch] = useNodeTree();
    const [filteredNodes] = useSharedState(
        IndexStore.getAppDetailsFilteredNodes(),
        IndexStore.getAppDetailsNodesFilteredObservable(),
    );
    const params = useParams<{ nodeType: NodeType }>();

    let _treeNodes = getTreeNodesWithChild(filteredNodes)

    const getPNodeName = (_string: string): AggregationKeys => {
        return getAggregator((_string.charAt(0).toUpperCase() + _string.slice(1)) as NodeType);
    };

    const handleClickOnNodes = (_node: string, parents?: Array<string>) => {
        let _clickedNodes = generateSelectedNodes(clickedNodes, _treeNodes, _node, parents)
        registerNodeClick(_clickedNodes)
    }

    const _urlArray = window.location.href.split(URLS.APP_DETAILS_K8 + '/');
    if (_urlArray?.length === 2) {
        const _kind = _urlArray[1].split('/')[0];
        let parent = getPNodeName(_kind)
        handleClickOnNodes(_kind, [parent.toLowerCase()])
    }

    const handleNodeClick = (treeNode: iNode, parentNode: iNode, e: any) => {
        if (e) {
            e.stopPropagation();
        }

        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.ParentNodeClick,
                selectedNode: treeNode,
            });

            AppDetailsStore.setNodeTreeActiveParentNode(treeNode);
        } else {
            dispatch({
                type: NodeTreeActions.ChildNodeClick,
                selectedNode: treeNode,
                parentNode: parentNode,
            });

            AppDetailsStore.setNodeTreeActiveParentNode(parentNode);
            AppDetailsStore.setNodeTreeActiveNode(treeNode);
        }
    };

    const _navigate = (nodeToBeSelected) => {
        let _url = url;

        if (!params.nodeType) {
            _url = `${url}/${nodeToBeSelected.name.toLowerCase()}`;
        }

        history.push(_url);
    };



    const getInfo = (nodeByKind) => {
        return nodeByKind.map((_node) => {
            return getNodeStatus(_node);
        });
    };

    useEffect(() => {
        if (!treeNodes || treeNodes.length === 0) return;

        let activeParentNode = AppDetailsStore.getNodeTreeActiveParentNode();
        let activeNode = AppDetailsStore.getNodeTreeActiveNode();

        if (!activeParentNode) {
            const _urlArray = window.location.href.split(URLS.APP_DETAILS_K8 + '/');

            if (_urlArray?.length === 2) {
                const _kind = _urlArray[1].split('/')[0];

                const _nodesByKind = IndexStore.getiNodesByKind(_kind);
                if (_nodesByKind && _nodesByKind.length > 0) {
                    activeParentNode = {
                        name: getPNodeName(_kind),
                        childNodes: [
                            {
                                name: _nodesByKind[0].kind,
                                status: getInfo(_nodesByKind),
                            },
                        ],
                    } as iNode;
                }
            } else {
                const pods = IndexStore.getiNodesByKind(NodeType.Pod);

                if (pods.length > 0) {
                    activeParentNode = {
                        name: getPNodeName(NodeType.Pod),
                        childNodes: [
                            {
                                name: pods[0].kind,
                            },
                        ],
                    } as iNode;
                }
            }
        }

        activeParentNode = activeParentNode || treeNodes[0];
        activeNode = activeNode || activeParentNode.childNodes[0];

        _navigate(activeNode);

        setTimeout(() => {
            handleNodeClick(activeParentNode, null, null);
            handleNodeClick(activeNode, activeParentNode, null);
        }, 100);
    }, [treeNodes.length]);

    useEffect(() => {
        dispatch({
            type: NodeTreeActions.Init,
            nodes: filteredNodes,
        });

        const _arr = url.split(URLS.APP_DETAILS_K8);

        setK8URL(_arr[0] + URLS.APP_DETAILS_K8);
    }, [filteredNodes.length]);

    const hasErrorInTreeNode = (treeNode: iNode) => {
        if (treeNode.status && typeof treeNode.status === "string" && treeNode.status.toLowerCase() === 'degraded') {
            return true;
        }
        return false;
    };

    const hasErrorInChildTreeNode = (pTreeNode: iNode) => {
        let erroNodes = pTreeNode.childNodes.filter((cNode) => hasErrorInTreeNode(cNode));

        return erroNodes.length > 0;
    };

    const makeNodeTree = (treeNodes: iNodes, parentNode?: iNode) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div
                        className={`flex left cursor fw-6 cn-9 fs-14 `}
                        onClick={(e) => handleNodeClick(treeNode, parentNode, e)}
                    >
                        {treeNode.childNodes?.length > 0 ? (
                            <React.Fragment>
                                <DropDown
                                    className={`${treeNode.isSelected ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                                />
                                <div className={`fs-14 fw-6 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-20 `}>
                                    {treeNode.name}
                                    {!treeNode.isSelected && hasErrorInChildTreeNode(treeNode) && (
                                        <ErrorImage
                                            className="icon-dim-16 rotate"
                                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                                        />
                                    )}
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <NavLink
                                    to={`${k8URL}/${treeNode.name.toLowerCase()}`}
                                    className={`no-decor fs-14 pointer w-100 fw-4 flex left mr-8 pl-8 pr-8 pt-6 pb-6 lh-1-43 ${
                                        treeNode.isSelected ? 'bcb-1 cb-5' : 'cn-7 resource-tree__nodes '
                                    }`}
                                >
                                    {treeNode.name}
                                    {hasErrorInTreeNode(treeNode) && (
                                        <ErrorImage
                                            className="icon-dim-16 rotate"
                                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                                        />
                                    )}
                                </NavLink>
                            </React.Fragment>
                        )}
                    </div>

                    {treeNode.childNodes?.length > 0 && treeNode.isSelected && (
                        <div className={`pl-24`}>{makeNodeTree(treeNode.childNodes, treeNode)} </div>
                    )}
                </div>
            );
        });
    };

    return <div>{treeNodes && treeNodes.length > 0 && makeNodeTree(treeNodes)}</div>;
}


export function generateSelectedNodes(clickedNodes: Map<string, string>, _treeNodes: Array<iNode>, _node: string, parents?: Array<string>): Map<string, string> {
    let _nodeLowerCase = _node.toLowerCase()
    if (clickedNodes.has(_nodeLowerCase)) {
        return
    }
    //If parents length is zero then it is the aggregation key which is clicked
    if ((parents ?? []).length == 0) {
        //if aggregation key is clicked and there is no previous selection then we
        //drill down till we reach node which is doesnt have child node
        //currently at max only 3 levels are possible
        if (clickedNodes.size == 0) {
            let childNodes = _treeNodes.find(_tn => _tn.name.toLowerCase() == _nodeLowerCase)?.childNodes
            if ((childNodes ?? []).length > 0) {
                clickedNodes.set(childNodes[0].name.toLowerCase(), '')
                if ((childNodes[0].childNodes ?? []).length > 0) {
                    clickedNodes.set(childNodes[0].childNodes[0].name.toLowerCase(), '')
                }
            }
        }
        clickedNodes.set(_nodeLowerCase, '')
    } else {
        //parents length 2 is possible only if this is pod that means click happened on child of pod node
        //parent length 1 but node is not type pod means it is a leaf node
        if (parents.length == 2 || (parents.length == 1 && _nodeLowerCase != NodeType.Pod.toLowerCase())) {
            //remove if leaf node selected previouslf if any
            let _childNodes = _treeNodes.flatMap(_tn => _tn.childNodes)
            let leafNode = _childNodes.find(_cn => clickedNodes.has(_cn.name.toLowerCase()) && _cn.name.toLowerCase() != NodeType.Pod.toLowerCase())
            if (leafNode) {
                clickedNodes.delete(leafNode.name.toLowerCase())
            } else {
                leafNode = _childNodes.find(_cn => clickedNodes.has(_cn.name.toLowerCase()) && _cn.kind.toLowerCase() == NodeType.Pod.toLowerCase())
                if (leafNode) {
                    leafNode = leafNode.childNodes?.find(_cn => clickedNodes.has(_cn.name.toLowerCase()))
                    if (leafNode) {
                        clickedNodes.delete(leafNode.name.toLowerCase())
                    }
                }
            }
        }
        parents.forEach( _p => clickedNodes.set(_p.toLowerCase(), ''))
        clickedNodes.set(_nodeLowerCase, '')
    }
    return clickedNodes
}

export default NodeTreeComponent;
