
import { useReducer, useEffect } from "react";
import { iNode } from "./node.type";

export const NodeTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    MarkActive: "MARK_ACTIVE"
};

export const NodesJSON = [
    {
        name: "WorkLoad",
        icon: "",
      
        childNodes: [
            {
                name: "Cron Jobs",
                icon: "",
                childNodes: [
                    {
                        name: "Pods",
                        icon: "",
                        type: 'Pod'
                    },
                    {
                        name: "Jobs",
                        icon: "",
                        type: 'Pod'
                    }
                ]
            },
            {
                name: "Service",
                icon: "",
                type: 'Service'
            }
        ]

    },
    {
        name: "Replica Set",
        icon: "",
        type: 'GenericInfo'
    },
    {
        name: "Pods",
        icon: "",
        type: 'Pod'
    },
    {
        name: "Networking",
        icon: "",
        type: 'GenericInfo'
    },
    {
        name: "Config & Storage",
        icon: "",
        type: 'GenericInfo'
    }
]

const initialState = {
    loading: true,
    error: null,
    treeNodes: []
};

const reducer = (state: any, action: any) => {

    switch (action.type) {

        case NodeTreeActions.Init:
            return { ...state, loading: false, treeNodes: action.nodes };

        case NodeTreeActions.Error:
            return { ...state, loading: false, error: action.error };

        case NodeTreeActions.MarkActive: {
            state.treeNodes.forEach((node: iNode) => {
                node.isSelected = false
                if (node.name === action.node.name) {
                    node.isSelected = !action.node.isSelected
                }
            })
            return { ...state, treeNodes: state.treeNodes };
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

