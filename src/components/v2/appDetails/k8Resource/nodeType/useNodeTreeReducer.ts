
import { useReducer } from "react";
import { AggregationKeys, getAggregator, iNode, Node } from "../../appDetails.type";

export const NodeTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    ParentNodeClick: "PARENT_NODE_CLICK",
    ChildNodeClick: "CHILD_NODE_CLICK"
};


const initialState = {
    loading: true,
    error: null,
    treeNodes: [],
};

const handleParentNodeClick = (treeNodes: Array<iNode>, selectedNode: iNode) => {

    return treeNodes.map((node: iNode) => {
        if (node.name === selectedNode.name) {
            node.isSelected = !node.isSelected
        }

        return node
    })
}

const handleChildNodeClick = (treeNodes: Array<iNode>, selectedNode: iNode, parentNode: iNode) => {
    for (let index = 0; index < treeNodes.length; index++) {
        const cNodes = treeNodes[index].childNodes || [];

        for (let _index = 0; _index < cNodes.length; _index++) {
            const _cNode = cNodes[_index];

            _cNode.isSelected = false

            if (_cNode.name.toLowerCase() === selectedNode.name.toLowerCase()) {
                _cNode.isSelected = true
            }
        }
    }

    return treeNodes
}

const getChildiNodes = (nodes: Array<Node>, parentNodeName: string) => {

    let _nodes = []
    let _alreadyAddedNodes = []

    nodes.forEach((node: Node) => {
        const aggregator = getAggregator(node.kind)
        if (aggregator.toLowerCase() === parentNodeName.toLowerCase()) {
            if (_alreadyAddedNodes.indexOf(node.kind) === -1) {
                _alreadyAddedNodes.push(node.kind)
                const _inode = {} as iNode;
                _inode.name = node.kind
                _inode.info = node.info
                _nodes.push(_inode)
            }

        }
    });

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
            const initialNodes = getTreeNodes(action.nodes);

            return { ...state, loading: false, treeNodes: initialNodes };

        case NodeTreeActions.Error:
            return { ...state, loading: false, error: action.error };

        case NodeTreeActions.ParentNodeClick: {

            const tns = handleParentNodeClick(state.treeNodes, action.selectedNode)
            return { ...state, treeNodes: [...tns] };
        }

        case NodeTreeActions.ChildNodeClick: {
            const tns = handleChildNodeClick(state.treeNodes, action.selectedNode, action.parentNode)
            return { ...state, treeNodes: [...tns] };
        }

    }
};

export const useNodeTree = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return [state, dispatch];
};

