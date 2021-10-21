
import { useReducer, useEffect } from "react";
import { ResourceTreeActions, ResourceTreeTabs } from "./resourceTreeTab.type";
// import { ResourceTreeTab } from "./ResourceTreeTab";


const initialState = {
    loading: true,
    error: null,
    resourceTreeTabs: []
};

const reducer = (state: any, action: any) => {

    switch (action.type) {

        case ResourceTreeActions.Init:
            return { ...state, loading: false, resourceTreeTabs: action.tabs };

        case ResourceTreeActions.Error:
            return { ...state, loading: false, error: action.error };

        case ResourceTreeActions.AddTab:
            state.resourceTreeTabs.push(action.tab)
            return { ...state, resourceTreeTabs: state.resourceTreeTabs };

        case ResourceTreeActions.RemoveTab:
        let rc = state.resourceTreeTabs.filter(action.tab)
        return { ...state, resourceTreeTabs: rc };
    }
};

export const useResourceTree = () => {

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        let initialTabs = state.resourceTreeTabs;

        const k8Resource = {
            name: "K8 Resources",
            icon: "",
            className: "selected "
        }

        const logAnalyzer = {
            name: "Log Analyzer",
            icon: "",
            className: ""
        }

        initialTabs.push(k8Resource, logAnalyzer)
        dispatch({ type: ResourceTreeActions.Init, tabs: initialTabs });
    }, []);

    return [state, dispatch];

};

