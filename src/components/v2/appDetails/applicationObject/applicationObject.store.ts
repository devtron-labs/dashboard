import { iLink } from "../../utils/tabUtils/tab.type";
import { BehaviorSubject } from 'rxjs';
import { ApplicationObject } from "./applicationObject.type";

let applicationObjectTabs: Array<ApplicationObject> = [];
let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject(applicationObjectTabs);

let currentTab: string = "";

const ApplicationObjectStore = {

    getApplicationObjectTabs: () => {
        return applicationObjectTabsSubject.getValue()
    },
    getApplicationObjectTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable()
    },
    addApplicationObjectTab: (tabName: string, tabURL: string) => {

        let found = false
        // applicationObjectTabs.map((tab) => {
        //     // tab.isSelected = false
        //     if (tab.name.toLowerCase() === tabName) {
        //         tab.isSelected = true
        //         found = true
        //     }
        // })

        for (let index = 2; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.name.toLowerCase() === tabName) {
                tab.isSelected = true
                found = true
            }
        }
        if (!found) {
            let tab = {} as ApplicationObject
            tab.name = tabName.toLowerCase()
            tab.url = tabURL
            tab.isSelected = true
            applicationObjectTabs.push(tab)
        }
        applicationObjectTabsSubject.next(applicationObjectTabs)
    },
    cleanApplicationObject: () => {
        applicationObjectTabs = []
        applicationObjectTabsSubject.next(applicationObjectTabs)
    }, 
    setCurrentTab: (_str: string) => {
        currentTab = _str
    },
    getCurrentTab: () => {
        return currentTab
    }
}

export default ApplicationObjectStore;