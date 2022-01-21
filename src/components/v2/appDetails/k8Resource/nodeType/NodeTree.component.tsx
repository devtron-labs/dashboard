import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { getTreeNodesWithChild } from './useNodeTreeReducer';
import { useHistory, useRouteMatch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import IndexStore from '../../index.store';
import { useSharedState } from '../../../utils/useSharedState';
import { AggregationKeys, getAggregator, iNode, iNodes, NodeType } from '../../appDetails.type';
import { URLS } from '../../../../../config';
import { ReactComponent as ErrorImage } from '../../../../../assets/icons/misc/errorInfo.svg';
import { getNodeStatus } from './nodeType.util';

function NodeTreeComponent({clickedNodes, registerNodeClick}: {clickedNodes: Map<string, string>, registerNodeClick: Dispatch<SetStateAction<Map<string, string>>>}) {
    const { url, path } = useRouteMatch();
    const history = useHistory();
    const [filteredNodes] = useSharedState(
        IndexStore.getAppDetailsFilteredNodes(),
        IndexStore.getAppDetailsNodesFilteredObservable(),
    );

    const _arr = url.split(URLS.APP_DETAILS_K8)

    const k8URL =_arr[0] + URLS.APP_DETAILS_K8


    const params = useParams<{ nodeType: NodeType }>()
    //This is used to re-render in case of click node update
    const [reRender, setReRender] = useState(false)

    let _treeNodes = getTreeNodesWithChild(filteredNodes)

    const getPNodeName = (_string: string): AggregationKeys => {
        return getAggregator((_string.charAt(0).toUpperCase() + _string.slice(1)) as NodeType);
    };

    const handleClickOnNodes = (_node: string, parents?: Array<string>, e?: any) => {
        if (e) {
            e.stopPropagation()
        }
        let _clickedNodes = generateSelectedNodes(clickedNodes, _treeNodes, _node, parents)
        registerNodeClick(_clickedNodes)
        setReRender(!reRender)
    }

    useEffect(() => {
        const _urlArray = window.location.href.split(URLS.APP_DETAILS_K8 + '/');
        if (_urlArray?.length === 2) {
            const [_kind, _ignore, _name] = _urlArray[1].split('/');
            let parent = getPNodeName(_kind)
            if (_name) {
                handleClickOnNodes(_name, [parent.toLowerCase(), _kind.toLowerCase()])
            } else {
                handleClickOnNodes(_kind, [parent.toLowerCase()])
            }
        } else {
            //FIXME: change this, it should not always be pod, it should be same as selected leafnode
            //if none has been clicked till now go to pod if pod are present else to some other leaf node
            history.push(url.replace(/\/$/, '') + getRedirectURLExtension(clickedNodes, _treeNodes))
        }
    }, [url])

    let tempNodes = _treeNodes
    while(tempNodes.length > 0) {
        tempNodes = tempNodes.flatMap(_tn => {
            _tn.isSelected = clickedNodes.has(_tn.name.toLowerCase())
            return (_tn.childNodes ?? [])
        })
    }

    const makeNodeTree = (treeNodes: iNodes, parents: Array<string>) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div
                        className={`flex left cursor fw-6 cn-9 fs-14 `}
                        onClick={(e) => handleClickOnNodes(treeNode.name.toLowerCase(), parents, e)}
                    >
                        {treeNode.childNodes?.length > 0 ? (
                            <React.Fragment>
                                <DropDown
                                    className={`${treeNode.isSelected ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                                />
                                <div className={`fs-14 fw-6 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-20 `}>
                                    {treeNode.name}
                                    {!treeNode.isSelected && treeNode.status == 'degraded' && (
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
                                    to={`${k8URL}/${parents.includes("pod")? 'pod/group/':''}${treeNode.name.toLowerCase()}`}
                                    className={`no-decor fs-14 pointer w-100 fw-4 flex left mr-8 pl-8 pr-8 pt-6 pb-6 lh-1-43 ${
                                        treeNode.isSelected ? 'bcb-1 cb-5' : 'cn-7 resource-tree__nodes '
                                    }`}
                                >
                                    {treeNode.name}
                                    {treeNode.status == 'degraded' && (
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
                        <div className={`pl-24`}>{makeNodeTree(treeNode.childNodes, [...parents, treeNode.name.toLowerCase()])} </div>
                    )}
                </div>
            );
        });
    };

    return <div>{_treeNodes && _treeNodes.length > 0 && makeNodeTree(_treeNodes, [] as Array<string>)}</div>;
}


export function generateSelectedNodes(clickedNodes: Map<string, string>, _treeNodes: Array<iNode>, _node: string, parents?: Array<string>): Map<string, string> {
    let _nodeLowerCase = _node.toLowerCase()
    // if (clickedNodes.has(_nodeLowerCase)) {
    //     return
    // }
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
        if (clickedNodes.has(_nodeLowerCase)) {
            clickedNodes.delete(_nodeLowerCase)
        } else {
            clickedNodes.set(_nodeLowerCase, '')
        }
    } else {
        //parents length 2 is possible only if this is pod that means click happened on child of pod node
        //parent length 1 but node is not type pod means it is a leaf node
        if (parents.length == 2 || (parents.length == 1 && _nodeLowerCase != NodeType.Pod.toLowerCase())) {
            //remove if leaf node selected previouslf if any
            let _childNodes = _treeNodes.flatMap(_tn => _tn.childNodes ?? [])
            let leafNode = _childNodes.find(_cn => clickedNodes.has(_cn.name.toLowerCase()) && _cn.name.toLowerCase() != NodeType.Pod.toLowerCase())
            if (leafNode) {
                clickedNodes.delete(leafNode.name.toLowerCase())
            } else {
                leafNode = _childNodes.find(_cn => clickedNodes.has(_cn.name.toLowerCase()) && _cn.name.toLowerCase() == NodeType.Pod.toLowerCase())
                if (leafNode) {
                    leafNode = leafNode.childNodes?.find(_cn => clickedNodes.has(_cn.name.toLowerCase()))
                    if (leafNode) {
                        clickedNodes.delete(leafNode.name.toLowerCase())
                    }
                }
            }
        }
        parents.forEach( _p => clickedNodes.set(_p.toLowerCase(), ''))
        if (parents.length == 1 && _nodeLowerCase == NodeType.Pod.toLowerCase() && clickedNodes.has(_nodeLowerCase)) {
            clickedNodes.delete(_nodeLowerCase)
        } else {
            clickedNodes.set(_nodeLowerCase, '')
        }
    }
    return clickedNodes
}

export function getRedirectURLExtension(clickedNodes: Map<string, string>, _treeNodes: Array<iNode>): string {
    //User has yet not clicked anything
    if (clickedNodes.size == 0) {
        let leafNode = _treeNodes.filter(_tn => _tn.name.toLowerCase() == AggregationKeys.Workloads.toLowerCase())
        .flatMap(_tn => (_tn.childNodes?.filter(_cn => _cn.name.toLowerCase() == NodeType.Pod.toLowerCase()) ?? []))
        .flatMap(_cn => (_cn.childNodes ?? []))
        .find((_cn, index) => index == 0)
        if (leafNode) {
            return "/pod/group/"+leafNode.name.toLowerCase()
        }
        leafNode = _treeNodes.flatMap(_tn => (_tn.childNodes ?? [])).find((_cn, index) => index == 0 )
        if (leafNode) {
            return "/"+leafNode.name.toLowerCase()
        }
    } else {
        let leafNodes = _treeNodes.flatMap(_tn => (_tn.childNodes?.filter(_cn => clickedNodes.has(_cn.name.toLowerCase())) ?? []))
        //more than one leafNodes click means user has clicked on pods as well as some other leaf node
        //therefore details of non-pod leafnode should be shown
        if (leafNodes.length > 1) {
            let leafNode = leafNodes.find(_ln => _ln.name.toLowerCase() != NodeType.Pod.toLowerCase())
            if(leafNode) {
                return "/"+leafNode.name.toLowerCase()
            }
        } else if(leafNodes.length == 1) {
            //case when clicked is a pod group
            let leafPodNode = leafNodes.filter(_ln => _ln.name.toLowerCase() == NodeType.Pod.toLowerCase())
            let leafNode = leafPodNode.flatMap(_ln => (_ln.childNodes ?? [])).find(_ln => clickedNodes.has(_ln.name.toLowerCase()))
            if (leafNode) {
                return "/pod/group/"+leafNode.name.toLowerCase()
            } else {
                leafNode = leafPodNode.flatMap(_ln => (_ln.childNodes ?? [])).find((_ln, index) => index == 0)
                if (leafNode) {
                    return "/pod/group/"+leafNode.name.toLowerCase()
                }
            }
            //case when clicked is not pod group
            leafNode = leafNodes.find(_ln => _ln.name.toLowerCase() != NodeType.Pod.toLowerCase())
            if(leafNode) {
                return "/"+leafNode.name.toLowerCase()
            }
        }
        //handle the case when none match, its same as clickedNodes size 0
        return getRedirectURLExtension(new Map<string, string>(), _treeNodes)
    }
}

export default NodeTreeComponent;
