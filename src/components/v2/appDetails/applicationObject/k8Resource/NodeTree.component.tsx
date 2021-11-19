import React, { useEffect } from 'react'
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { iNode, iNodes } from '../../node.type';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';

function NodeTreeComponent({ nodes, nodeKind, callback }) {

    const [{ treeNodes }, dispatch] = useNodeTree();

    const handleNodeClick = (treeNode: iNode, e: any) => {

        e.stopPropagation()

        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.MarkActive,
                node: treeNode
            })
        }
        else {
            callback(treeNode.name)
        }
    }

    const makeNodeTree = (treeNodes: iNodes) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div className="flex left cursor fw-6 cn-9 fs-14 pb-8" onClick={(e) => handleNodeClick(treeNode, e)}>
                        {treeNode.childNodes?.length > 0 &&
                            <DropDown
                                className={`rotate icon-dim-24 pointer ${treeNode.isSelected ? 'fcn-9' : 'fcn-5'}`}
                                style={{ ['--rotateBy' as any]: !treeNode.isSelected ? '-90deg' : '0deg' }}
                            />
                        }
                        <div className="fs-14 pointer w-100 fw-6 flex left pl-8 pr-8">
                            {treeNode.name}
                        </div>
                    </div>

                    {(treeNode.childNodes?.length > 0 && treeNode.isSelected) &&
                        <div className="pl-24">{makeNodeTree(treeNode.childNodes)} </div>
                    }
                </div>
            )
        })
    }

    useEffect(() => {
        if (nodes && nodes.length > 0) {
            dispatch({
                type: NodeTreeActions.Init,
                nodes: nodes
            })
        }
    }, [])

    return (
        <div>
            {treeNodes && treeNodes.length > 0 && makeNodeTree(treeNodes)}
        </div>
    )
}

export default NodeTreeComponent
