
import { useReducer, useEffect } from "react";
import AppDetailsStore from "../../appDetail.store";
import { AggregationKeys, getAggregator, Node, NodeType } from "../../appDetail.type";
import { iNodes, iNode } from "../../node.type";

export const NodeTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    NodeClick: "NODE_CLICK"
};


const initialState = {
    loading: true,
    error: null,
    treeNodes: [],
    selectedNodeKind: ""
};

const markActiveNode = (treeNodes: iNodes, selectedNode: string) => {
    return treeNodes.map((node: iNode) => {
        if(node.name.toLowerCase() === selectedNode.toLowerCase()){
            return node.isSelected = true
        }else if (node.childNodes?.length > 0){
            return markActiveNode(node.childNodes, selectedNode)
        }
    })
}

const getChildiNodes = (nodes: Array<Node>, parentNodeName: string) => {

    let _nodes = []
    let uniqueINodes = new Set();

    nodes.forEach((node: Node) => {
        const aggregator = getAggregator(node.kind)

        if (aggregator.toLowerCase() === parentNodeName.toLowerCase()) {
            uniqueINodes.add(node.kind)
        }
    });

    uniqueINodes.forEach((_n: any) => {
        const _inode = {} as iNode;
        _inode.name = _n
        _nodes.push(_inode)
    })

    return _nodes
}

const getTreeNodes = (_nodes: Array<Node>) => {

    const _inodes = [];

    Object.keys(AggregationKeys).map(key => {
        const aggregationKey = AggregationKeys[key];

        let cNodes = getChildiNodes(_nodes, aggregationKey)

        if (cNodes.length > 0) {
            const _inode = {} as iNode;
            _inode.name = aggregationKey
            _inode.childNodes = cNodes
            _inodes.push(_inode)
        }
    })

    return _inodes
}

const reducer = (state: any, action: any) => {
    switch (action.type) {

        case NodeTreeActions.Init:
            const resourceNodes = AppDetailsStore.getAppDetailsNodes();

            const initialNodes = getTreeNodes(resourceNodes);

            return { ...state, loading: false, treeNodes: initialNodes };

        case NodeTreeActions.Error:
            return { ...state, loading: false, error: action.error };

        case NodeTreeActions.NodeClick: {
            const tns = markActiveNode(state.treeNodes, action.selectedNode)
            return { ...state, treeNodes: tns };
        }
    }
};

export const useNodeTree = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return [state, dispatch];
};

