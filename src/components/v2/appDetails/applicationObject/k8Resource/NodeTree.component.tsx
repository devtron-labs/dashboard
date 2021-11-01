import React from 'react'
import { DropdownIcon } from '../../../../common';
import { iNode, iNodes } from './node.type';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';

function NodeTreeComponent(props) {

    const [{ treeNodes }, dispatch] = useNodeTree();

    const handleNodeClick = (treeNode: iNode, e: any) => {
        e.stopPropagation()
        console.log("handleNodeClick")

        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.MarkActive,
                node: treeNode
            })
        } else {
            console.log("no child node")
            props.updateNodeInfo(treeNode)
        }
    }

    const makeNodeTree = (treeNodes: iNodes) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div className="container cursor fw-6 cn-9  fs-14" onClick={(e) => handleNodeClick(treeNode, e)} >
                        <div className="row flex left pt-6 pb-6">
                            <div className="col-md-2">
                                {(treeNode.childNodes?.length > 0) && <DropdownIcon className={treeNode.isSelected ? 'rotate icon-dim-20' : ''} />}
                            </div>
                            <div className="col-md-10">
                                <span> {treeNode.name}</span>
                            </div>
                        </div>
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
