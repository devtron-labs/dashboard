import { BehaviorSubject } from 'rxjs';
import { ApplicationObject, iNode } from "./appDetails.type";
import { URLS } from "../../../config";

let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject([] as Array<ApplicationObject>);
let _nodeTreeActiveParentNode: iNode
let _nodeTreeActiveNode: iNode
let _maxTabAllowd = 6

const addAOT = (tabName: string, tabUrl: string, isSelected: boolean, title?: string) => {
    let tab = {} as ApplicationObject
    tab.name = tabName
    tab.url = tabUrl
    tab.isSelected = isSelected
    tab.title = title || tabName
    return tab
}

export const AppDetailsTabs = {
    k8s_Resources: "K8s Resources",
    log_analyzer: "Log Analyzer"
}

const AppDetailsStore = {
    getAppDetailsTabs: () => {
        return applicationObjectTabsSubject.getValue()
    },
    getAppDetailsTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable()
    },
    initAppDetailsTabs: (_url: string, displayLogAnalyzer: boolean, isLogAnalyserURL: boolean) => {
        let aots = [] as Array<ApplicationObject>

        aots.push(addAOT(AppDetailsTabs.k8s_Resources, _url + "/" + URLS.APP_DETAILS_K8, !isLogAnalyserURL))

        if (displayLogAnalyzer) {
            aots.push(addAOT(AppDetailsTabs.log_analyzer, _url + "/" + URLS.APP_DETAILS_LOG, isLogAnalyserURL))
            _maxTabAllowd = 7
        }

        applicationObjectTabsSubject.next([...aots])

        _nodeTreeActiveParentNode = undefined 
        _nodeTreeActiveNode = undefined
    },
    addAppDetailsTab: (tabKind: string, tabName: string, tabURL: string) => {

        if (!tabName || !tabURL || !tabKind) return

        let applicationObjectTabs = applicationObjectTabsSubject.getValue()

        if (applicationObjectTabs.length === _maxTabAllowd) {
            return false
        }

        let alredyAdded = false
        let title = tabKind + '/' + tabName
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
            applicationObjectTabs.push(addAOT(tabName, tabURL, true, title))
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])

        return true;
    },
    removeAppDetailsTab: (tabUrl: string) => {
        let _applicationObjectTabs = [];

        const applicationObjectTabs = applicationObjectTabsSubject.getValue();
        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = index === 0;
            if (tab.url !== tabUrl) {
                _applicationObjectTabs.push(tab);
            }
        }

        applicationObjectTabsSubject.next([..._applicationObjectTabs]);
    },
    markAppDetailsTabActive: (url: string, parentUrl?: string) => {
        let idTabFound = false

        const applicationObjectTabs = applicationObjectTabsSubject.getValue()

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.url === url) {
                tab.isSelected = true
                idTabFound = true
            }else if(tab.url.indexOf(parentUrl) > -1){
                tab.url = url 
                idTabFound = true
            }
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])

        return idTabFound
    },

    setNodeTreeActiveParentNode: (_n: iNode) => {
        _nodeTreeActiveParentNode = _n
    },
    getNodeTreeActiveParentNode: () => {
        return _nodeTreeActiveParentNode
    },

    setNodeTreeActiveNode: (_n: iNode) => {
        _nodeTreeActiveNode = _n
    },

    getNodeTreeActiveNode: () => {
        return _nodeTreeActiveNode
    }

}

export default AppDetailsStore;