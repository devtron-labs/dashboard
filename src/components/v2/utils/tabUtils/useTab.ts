
import { table } from "console";
import { useReducer, useEffect } from "react";
import { iLink, iLinks } from "./link.type";

export const TabActions = {
    Init: "INIT",
    Error: "ERROR",
    AddTab: "ADD_TAB",
    RemoveTab: "REMOVE_TAB",
    MarkActive: "MARK_ACTIVE",
    EnableTab: "ENABLE_TAB"
};

const initialState = {
    loading: true,
    error: null,
    tabs: [],
    activeTab: ''
};

const reducer = (state: any, action: any) => {

    switch (action.type) {

        case TabActions.Init:
            return { ...state, loading: false, tabs: action.tabs , activeTab: action.tabs[0].name};

        case TabActions.Error:
            return { ...state, loading: false, error: action.error };

        case TabActions.AddTab: {
            let tab = {} as iLink;
            tab.name = action.tabName
            tab.isSelected = true

            state.tabs = state.tabs.map((tab: iLink) => {
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
            state.tabs.forEach((tab: iLink) => {
                tab.isSelected = false
                if (tab.name === action.tabName) {
                    tab.isSelected = true
                    tab.isDisabled = false
                }
            })
            return { ...state, tabs: state.tabs , activeTab: action.tabName};
        }

        case TabActions.EnableTab: {
            state.tabs.forEach((tab: iLink) => {
                if (tab.name === action.tabName) {
                    tab.isDisabled = false
                }
            })
            return { ...state, tabs: state.tabs };
        }

    }
};



export const useTab = (tabs: iLinks) => {

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        dispatch({ type: TabActions.Init, tabs: tabs });
    }, []);

    return [state, dispatch];
};

