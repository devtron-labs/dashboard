import React from 'react'
import { DropdownIcon } from '../../../../common';
import { iNode } from './node.type';
import { useNodeTree } from './useNodeTreeReducer';

function NodeTreeComponent() {

    const [{ treeNodes }, dispatch] = useNodeTree();

    const makeNodeTree = (treeNodes) => {
        return treeNodes.map((treeNode: iNode) => {
            return (
                <div>
                    <div className="flex left">
                        {(treeNode.childNodes?.length > 0) && <DropdownIcon className={treeNode.isSelected ? 'rotate icon-dim-20' : ''} />}
                        <span> {treeNode.name}</span>
                    </div>
                    { (treeNode.childNodes?.length > 0) && <div className="pl-16">{makeNodeTree(treeNode.childNodes)} </div>}
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
