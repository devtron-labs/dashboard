import { BehaviorSubject } from 'rxjs';
import { ApplicationObject } from "./appDetails.type";
import { URLS } from "../../../config";
import { Tab } from '../../configMaps/ConfigMap';

let applicationObjectTabs: Array<ApplicationObject> = [];
let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject(applicationObjectTabs);
let currentTab: string = "";

const addAOT = (tabName: string, tabUrl: string, isSelected: boolean) => {
    let tab = {} as ApplicationObject
    tab.name = tabName.toLowerCase()
    tab.url = tabUrl
    tab.isSelected = isSelected
    applicationObjectTabs.push(tab)
}

const AppDetailsStore = {

    getApplicationObjectTabs: () => {
        return applicationObjectTabsSubject.getValue()
    },
    getApplicationObjectTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable()
    },
    initApplicationObjectTab: (_url: string) => {
        applicationObjectTabs = []

        addAOT(URLS.APP_DETAILS_K8, _url + "/" + URLS.APP_DETAILS_K8, true)
        addAOT(URLS.APP_DETAILS_LOG, _url + "/" + URLS.APP_DETAILS_LOG, false)

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    addApplicationObjectTab: (tabKind: string, tabName: string, tabURL: string) => {

        if (!tabName || !tabURL || !tabKind) return

        let alredyAdded = false
        tabName = tabKind + '/...' + tabName.slice(-6)

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
    removeApplicationObjectTab: (tabName: string) => {
        let _applicationObjectTabs = []

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = index === 0
            if (tab.name.toLowerCase() !== tabName.toLowerCase()) {
                _applicationObjectTabs.push(tab)
            }
        }

        applicationObjectTabs = _applicationObjectTabs
        
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
        AppDetailsStore.markApplicationObjectTabActive(_str)
    },
    getCurrentTab: () => {
        return currentTab
    }
}

export default AppDetailsStore;