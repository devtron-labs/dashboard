
import { useReducer, useEffect } from "react";
import { iTab, iTabs } from "./tab.type";

export const TabActions = {
    Init: "INIT",
    Error: "ERROR",
    AddTab: "ADD_TAB",
    RemoveTab: "REMOVE_TAB",
    MarkActive: "MARK_ACTIVE"
};

const initialState = {
    loading: true,
    error: null,
    tabs: []
};

const reducer = (state: any, action: any) => {

    switch (action.type) {

        case TabActions.Init:
            return { ...state, loading: false, tabs: action.tabs };

        case TabActions.Error:
            return { ...state, loading: false, error: action.error };

        case TabActions.AddTab: {
            let tab = {} as iTab;
            tab.name = action.tabName
            tab.isSelected = true

            state.tabs = state.tabs.map((tab: iTab) => {
                tab.isSelected = false
                return tab
            })

            state.tabs.push(tab)

            return { ...state, tabs: state.tabs };
        }

        case TabActions.RemoveTab:
            let rc = state.tabs.filter(action.tab.name === action.tab.name)
            return { ...state, tabs: rc };

        case TabActions.MarkActive: {
            state.tabs.forEach((tab: iTab) => {
                tab.isSelected = false
                if (tab.name === action.tabName) {
                    tab.isSelected = true
                }
            })
            return { ...state, tabs: state.tabs };
        }

    }
};



export const useTab = (tabs: iTabs) => {

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        dispatch({ type: TabActions.Init, tabs: tabs });
    }, []);

    return [state, dispatch];
};

