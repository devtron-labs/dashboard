import React from 'react'
import { DropdownIcon } from '../../../../common';
import { iNode, iNodes } from './node.type';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';

function NodeTreeComponent(props) {

    const [{ treeNodes }, dispatch] = useNodeTree();

    const handleNodeClick = (treeNode: iNode,) => {
        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.MarkActive,
                node: treeNode
            })
        } else {
            props.updateNodeInfo(treeNode)
        }
    }

    const makeNodeTree = (treeNodes: iNodes) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div className="flex left" onClick={(e) => handleNodeClick(treeNode)} >
                        {(treeNode.childNodes?.length > 0) && <DropdownIcon className={treeNode.isSelected ? 'rotate icon-dim-20' : ''} />}
                        <span> {treeNode.name}</span>
                    </div>
                    { (treeNode.childNodes?.length > 0 && treeNode.isSelected) &&
                        <div className="pl-16">{makeNodeTree(treeNode.childNodes)} </div>
                    }
                </div>
            )
        })
    }

    return (
        <div>
            {makeNodeTree(treeNodes)}
        </div>
    )
}

export default NodeTreeComponent
