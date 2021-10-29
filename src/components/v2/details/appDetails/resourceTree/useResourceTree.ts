
import { useReducer, useEffect } from "react";
import {iTab } from "./tab.type";

export const ResourceTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    AddTab: "ADD_TAB",
    RemoveTab: "REMOVE_TAB",
    MarkActive: "MARK_ACTIVE"
};

export const TabsJSON = {
    "K8 Resources": {
        name: "K8 Resources",
        icon: "K8Resource",
        className: "",
        isSelected: true
    },
    "Log Analyzer": {
        name: "Log Analyzer",
        icon: "LogAnalyser",
        className: "",
        isSelected: false
    },
    "tab 1": {
        name: "tab 1",
        icon: "",
        className: "",
        isSelected: false
    }
}

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

        case ResourceTreeActions.AddTab: {
            let isFound = false
            state.resourceTreeTabs.forEach((tab: iTab) => {
                tab.isSelected = false
                if (tab.name === action.tab.name) {
                    isFound = true
                    tab.isSelected = true
                }
            })

            if (!isFound) {
                state.resourceTreeTabs.push(action.tab)
            }
            return { ...state, resourceTreeTabs: state.resourceTreeTabs };
        }

        case ResourceTreeActions.RemoveTab:
            let rc = state.resourceTreeTabs.filter(action.tab)
            return { ...state, resourceTreeTabs: rc };

        case ResourceTreeActions.MarkActive: {
            state.resourceTreeTabs.forEach((tab: iTab) => {
                tab.isSelected = false
                if (tab.name === action.tabName) {
                    tab.isSelected = true
                }
            })
            return { ...state, resourceTreeTabs: state.resourceTreeTabs };
        }

    }
};

export const useResourceTree = () => {

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        let initialTabs = [];
        initialTabs.push(TabsJSON["K8 Resources"], TabsJSON["Log Analyzer"])
        dispatch({ type: ResourceTreeActions.Init, tabs: initialTabs });
    }, []);

    return [state, dispatch];

};

