import React, { useEffect } from 'react'
import { useState } from 'react';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { iNode, iNodes } from '../../node.type';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';
import { useRouteMatch, useHistory } from 'react-router';
import { URLS } from '../../../../../config';

function NodeTreeComponent() {

   // const [selectedNodeKind, setSelectedNodeKind] = useState("")

    const { url, path } = useRouteMatch();
    const history = useHistory();

    const [{ treeNodes, selectedNodeKind }, dispatch] = useNodeTree();

    const markTreeNodeActive = (treeNodeName, isParent) => {
        dispatch({
            type: NodeTreeActions.NodeClick,
            selectedNode: treeNodeName,
            isParent: isParent
        })
    }
    const handleNodeClick = (treeNode: iNode, e: any) => {
        e.stopPropagation()
        console.log("handleNodeClick", treeNode)

        markTreeNodeActive(treeNode.name, treeNode.childNodes?.length > 0)
    }

    useEffect(() => {
        console.log("selectedNodeKind", selectedNodeKind)

        if(selectedNodeKind){
            let link = `${url.split(URLS.APP_DETAILS_K8)[0]}${URLS.APP_DETAILS_K8}/${selectedNodeKind.toLowerCase()}`;
            history.push(link);
        }
    }, [selectedNodeKind])

    useEffect(() => {
        dispatch({
            type: NodeTreeActions.Init
        })
    }, [])

    const makeNodeTree = (treeNodes: iNodes) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name} >
                    <div className="flex left cursor fw-6 cn-9 fs-14" onClick={(e) => handleNodeClick(treeNode, e)}>
                        {treeNode.childNodes?.length > 0 &&
                            <DropDown
                                className={`rotate icon-dim-24 pointer ${treeNode.isSelected ? 'fcn-9' : 'fcn-5'}`}
                                style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                            />
                        }

                        <div className={`fs-14 pointer w-100 fw-4 flex left pl-8 pr-8 pt-6 pb-6 lh-20 ${(treeNode.isSelected) ? 'bcb-1 cb-5' : ''}`}>
                            {treeNode.name}
                        </div>
                    </div>

                    {(treeNode.childNodes?.length > 0 && treeNode.isSelected) &&
                        <div className="pl-24 ">{makeNodeTree(treeNode.childNodes)} </div>
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
