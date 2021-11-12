
import { useReducer, useEffect } from "react";
import { AggregationKeys, getAggregator, Node, NodeType } from "../../appDetail.type";
import { iNode, iNodes, iNodeType } from "./node.type";

export const NodeTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    MarkActive: "MARK_ACTIVE"
};


const initialState = {
    loading: true,
    error: null,
    treeNodes: []
};

const markActiveNode = (treeNodes: iNodes, selectedNode: iNode) => {

    treeNodes.forEach((node: iNode) => {
        node.isSelected = false
        if (node.name.toLowerCase() === selectedNode.name.toLowerCase()) {
            node.isSelected = !node.isSelected
            return
        } else if (node.childNodes?.length > 0) {
            markActiveNode(node.childNodes, selectedNode)
        }
    })

    return treeNodes
}

const reducer = (state: any, action: any) => {
    switch (action.type) {

        case NodeTreeActions.Init:
            return { ...state, loading: false, treeNodes: action.nodes };

        case NodeTreeActions.Error:
            return { ...state, loading: false, error: action.error };

        case NodeTreeActions.MarkActive: {
            return { ...state, treeNodes: markActiveNode(state.treeNodes, action.node) };
        }
    }
};

const getChildiNodes = (nodes: Array<Node>, parentNodeName: string) => {

    let _nodes = []
    let uniqueINodes = new Set();

    nodes.forEach((node: Node) => {
        const aggregator = getAggregator(node.kind)
        
        if (aggregator.toLowerCase() === parentNodeName.toLowerCase()) {
            console.log(node)
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

export const useNodeTree = (nodes: Array<Node>) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (nodes.length > 0) {
            const initialNodes = getTreeNodes(nodes);
            dispatch({ type: NodeTreeActions.Init, nodes: initialNodes });
        }
    }, [nodes]);

    return [state, dispatch];
};

