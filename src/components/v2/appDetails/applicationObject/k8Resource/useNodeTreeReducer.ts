
import { useReducer, useEffect } from "react";
import { iNode, iNodes, iNodeType } from "./node.type";

export const NodeTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    MarkActive: "MARK_ACTIVE"
};

export const NodesJSON = [
    {
        id: 1,
        name: "WorkLoad",
        icon: "",
        childNodes: [
            {
                id: 2,
                name: "Cron Jobs",
                icon: "",
                childNodes: [
                    {
                        id: 50,
                        name: "Pods",
                        icon: "",
                        type: iNodeType.Pods
                    },
                    {
                        id: 51,
                        name: "Jobs",
                        icon: "",
                        type: 'Service'
                    }
                ]
            },
            {
                id: 3,
                name: "Service",
                icon: "",
                type: 'Service'
            }
        ]

    },
    {
        id: 4,
        name: "Replica Set",
        icon: "",
        childNodes: [
            {
                id: 53,
                name: "Pods",
                icon: "",
                type: iNodeType.Pods
            },
            {
                id: 54,
                name: "Jobs",
                icon: "",
                type: 'Service'
            }
        ]

    },
    {
        id: 5,
        name: "Pods",
        icon: "",
        type: iNodeType.Pods
    },
    {
        id: 6,
        name: "Networking",
        icon: "",
        type: 'GenericInfo'
    },
    {
        id: 7,
        name: "Config & Storage",
        icon: "",
        type: 'GenericInfo',
        childNodes: [
            {
                id: 2,
                name: "Cron Jobs",
                icon: "",
                childNodes: [
                    {
                        id: 50,
                        name: "Pods",
                        icon: "",
                        type: iNodeType.Pods
                    },
                    {
                        id: 51,
                        name: "Jobs",
                        icon: "",
                        type: 'Service'
                    }
                ]
            },
            {
                id: 3,
                name: "Service",
                icon: "",
                type: 'Service'
            }
        ]
    }
]

const initialState = {
    loading: true,
    error: null,
    treeNodes: []
};

const markActiveNode = (treeNodes: iNodes, selectedNode: iNode) => {
    for (let index = 0; index < treeNodes.length; index++) {
        const node = treeNodes[index];
        if (node.id === selectedNode.id) {
            node.isSelected = true //!node.isSelected
            break
        } else if (node.childNodes?.length > 0) {
            markActiveNode(node.childNodes, selectedNode)
        }
    }
    // treeNodes.forEach((node: iNode) => {
    //     // node.isSelected = false
    //     if (node.id === selectedNode.id) {
    //         node.isSelected = !node.isSelected
    //         return
    //     } else if (node.childNodes?.length > 0) {
    //         markActiveNode(node.childNodes, selectedNode)
    //     }
    // })
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

export const useNodeTree = () => {

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        let initialNodes = state.treeNodes;
        // initialNodes.push(NodesJSON["K8 Resources"], NodesJSON["Log Analyzer"])
        dispatch({ type: NodeTreeActions.Init, nodes: NodesJSON });
    }, []);

    return [state, dispatch];

};

