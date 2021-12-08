import React, { useEffect, useState } from 'react'
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { NodeTreeActions, useNodeTree } from '../useNodeTreeReducer';
import { useHistory, useRouteMatch } from "react-router";
import { NavLink } from 'react-router-dom';
import IndexStore from '../../index.store';
import { useSharedState } from '../../../utils/useSharedState';
import { iNode, iNodes } from '../../appDetails.type';


function NodeTreeComponent() {
    const { url, path } = useRouteMatch();
    const history = useHistory();
    //const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())
    const [selectedNodeKind, setSelectedNodeKind] = useState("")
    const [{ treeNodes }, dispatch] = useNodeTree();
    const [filteredNodes] = useSharedState(IndexStore.getAppDetailsFilteredNodes(), IndexStore.getAppDetailsNodesFilteredObservable())

    const handleNodeClick = (treeNode: iNode, parentNode: iNode, e: any) => {
        if (e) { e.stopPropagation() }

        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.ParentNodeClick,
                selectedNode: treeNode,
            })
        } else {
            dispatch({
                type: NodeTreeActions.ChildNodeClick,
                selectedNode: treeNode,
                parentNode: parentNode
            })

            setSelectedNodeKind(treeNode.name)
        }
    }

    useEffect(() => {
        const firstNode = treeNodes[0]

        if (!selectedNodeKind && firstNode && firstNode.childNodes && firstNode.childNodes.length > 0) {
            let firstChildNode = firstNode.childNodes[0];

            let link = `${url}/${firstChildNode.name.toLowerCase()}`;
            history.push(link);
            
            setTimeout(() => {
                handleNodeClick(firstNode, null, null)
                handleNodeClick(firstChildNode, firstNode, null)
            }, 100)
        }

    }, [treeNodes.length, selectedNodeKind])

    useEffect(() => {

        dispatch({
            type: NodeTreeActions.Init,
            nodes: filteredNodes,

        })
        setSelectedNodeKind('')

    }, [filteredNodes.length])

    const makeNodeTree = (treeNodes: iNodes, parentNode?: iNode) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name} >
                    <div className={`flex left cursor fw-6 cn-9 fs-14 `} onClick={(e) => handleNodeClick(treeNode, parentNode, e)}>

                        {treeNode.childNodes?.length > 0 ?
                            <React.Fragment>
                                <DropDown
                                    className={`rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                                />
                                <div className={`fs-14 fw-6 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-20 `}>
                                    {treeNode.name}
                                </div>
                            </React.Fragment>
                            :

                            <NavLink to={`${url}/${treeNode.name.toLowerCase()}`} className={`resource-tree__nodes no-decor fs-14 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-1-43 ${(treeNode.isSelected) ? 'bcb-1 cb-5' : 'cn-7'}`}>
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
