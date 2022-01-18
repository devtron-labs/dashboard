
import { useReducer } from "react";
import { AggregationKeys, getAggregator, iNode, Node, NodeType } from '../../appDetails.type';
import { getPodsRootParent, reduceKindStatus } from "../../index.store";

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

export const getTreeNodesWithChild = (_nodes: Array<Node>): Array<iNode> => {
    let podParents = getPodsRootParent(_nodes)
    const _inodes = [] as Array<iNode>;

    let nodesByAggregator = _nodes.reduce((nodesByAggregator: Map<string, Map<string, string | Array<[string, string]>>> , node: Node) => {
        let agg = getAggregator(node.kind)
        if (!nodesByAggregator.get(agg)) {
            nodesByAggregator.set(agg, new Map<string, string | Array<[string, string]>>())
        }
        if (!nodesByAggregator.get(agg).get(node.kind)) {
            nodesByAggregator.get(agg).set(node.kind, node.health?.status ?? '')
        } else {
            //At this stage we know status in string therefore we can safely cast it to string
            nodesByAggregator.get(agg).set(node.kind, reduceKindStatus(nodesByAggregator.get(agg).get(node.kind) as string, node.health?.status))
        }
        return nodesByAggregator
    }, new Map<string, Map<string, string | Array<[string, string]>>>())

    Object.keys(AggregationKeys).map(key => {
        if (nodesByAggregator.get(AggregationKeys[key])?.size > 0) {
            const _inode = {} as iNode;
            _inode.name = AggregationKeys[key]
            _inode.childNodes = Array.from(nodesByAggregator.get(AggregationKeys[key]), ([name, value]) => {
                let _node = { name: name, status: value, isSelected: false } as iNode
                if (name.toLowerCase() == NodeType.Pod.toLowerCase() && podParents.length > 0) {
                    _node.childNodes = podParents.map( _podParent => {
                        let pParts = _podParent[0].split("/")
                        return {name: pParts[pParts.length-1], status: _podParent[1], isSelected: false} as iNode
                    })
                }
                return _node
            }).sort((a, b) => a.name < b.name? -1 : 1)
            _inodes.push(_inode)
        }
    })
    return _inodes
}



const reducer = (state: any, action: any) => {

    switch (action.type) {

        case NodeTreeActions.Init:
            const initialNodes = getTreeNodesWithChild(action.nodes);

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