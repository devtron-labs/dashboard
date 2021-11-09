import { BehaviorSubject } from 'rxjs';
import { ApplicationObject } from "./applicationObject.type";
import { URLS } from "../../../../config";

let applicationObjectTabs: Array<ApplicationObject> = [];
let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject(applicationObjectTabs);
let baseURL: string = '';
let currentTab: string = "";

const addAOT = (tabName: string, tabUrl: string, isSelected: boolean) => {
    let tab = {} as ApplicationObject
    tab.name = tabName.toLowerCase()
    tab.url = tabUrl
    tab.isSelected = isSelected
    applicationObjectTabs.push(tab)
}

const ApplicationObjectStore = {

    getApplicationObjectTabs: () => {
        return applicationObjectTabsSubject.getValue()
    },
    getApplicationObjectTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable()
    },
    initApplicationObjectTab: () => {
        applicationObjectTabs = []

        addAOT(URLS.APP_DETAILS_K8, baseURL + URLS.APP_DETAILS_K8, true)
        addAOT(URLS.APP_DETAILS_LOG, baseURL + URLS.APP_DETAILS_LOG, false)

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    addApplicationObjectTab: (tabName: string, tabURL: string) => {

        if(!tabName || !tabURL) return

        let alredyAdded = false
     
        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.name.toLowerCase() === tabName.toLowerCase()) {
                tab.isSelected = true
                alredyAdded = true
            }
        }

        if (!alredyAdded) {
            addAOT(tabName, tabURL, true)
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    markApplicationObjectTabActive: (tabName: string) => {
        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.name.toLowerCase() === tabName.toLowerCase()) {
                tab.isSelected = true
            }
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    setCurrentTab: (_str: string) => {
        currentTab = _str
        ApplicationObjectStore.markApplicationObjectTabActive(_str)
    },
    getCurrentTab: () => {
        return currentTab
    },
    setBaseURL: (_str: string) => {
        baseURL = _str
    },
    getBaseURL: () => {
        return baseURL
    },
}

export default ApplicationObjectStore;