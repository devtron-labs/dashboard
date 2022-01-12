import { BehaviorSubject } from 'rxjs';
import { ApplicationObject, iNode } from './appDetails.type';
import { URLS } from '../../../config';

let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject(
    [] as Array<ApplicationObject>,
);
let _nodeTreeActiveParentNode: iNode;
let _nodeTreeActiveNode: iNode;
let _maxTabAllowd = 6;

const addAOT = (tabName: string, tabUrl: string, isSelected: boolean, title?: string) => {
    let tab = {} as ApplicationObject;
    tab.name = tabName;
    tab.url = tabUrl;
    tab.isSelected = isSelected;
    tab.title = title || tabName;
    tab.isDeleted = false;
    return tab;
};

export const AppDetailsTabs = {
    k8s_Resources: 'K8s Resources',
    log_analyzer: 'Log Analyzer',
};

const AppDetailsStore = {
    getAppDetailsTabs: () => {
        return applicationObjectTabsSubject.getValue();
    },
    getAppDetailsTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable();
    },
    initAppDetailsTabs: (_url: string, displayLogAnalyzer: boolean, isLogAnalyserURL: boolean) => {
        let aots = [] as Array<ApplicationObject>;

        let url = `${_url}${_url.endsWith('/') ? '' : '/'}`;

        aots.push(addAOT(AppDetailsTabs.k8s_Resources, url + URLS.APP_DETAILS_K8, !isLogAnalyserURL));

        if (displayLogAnalyzer) {
            aots.push(addAOT(AppDetailsTabs.log_analyzer, _url + '/' + URLS.APP_DETAILS_LOG, isLogAnalyserURL));
            _maxTabAllowd = 7;
        }

        applicationObjectTabsSubject.next([...aots]);

        _nodeTreeActiveParentNode = undefined;
        _nodeTreeActiveNode = undefined;
    },
    addAppDetailsTab: (tabKind: string, tabName: string, tabURL: string) => {
        if (!tabName || !tabURL || !tabKind) return;

        let applicationObjectTabs = applicationObjectTabsSubject.getValue();

        if (applicationObjectTabs.length === _maxTabAllowd) {
            return false;
        }

        let alreadyAdded = false;
        let title = tabKind + '/' + tabName;
        tabName = tabKind + '/...' + tabName.slice(-6);

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false;
            if (tab.name.toLowerCase() === tabName.toLowerCase()) {
                tab.isSelected = true;
                alreadyAdded = true;
            }
        }

        if (!alreadyAdded) {
            applicationObjectTabs.push(addAOT(tabName, tabURL, true, title));
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs]);

        return true;
    },
    removeAppDetailsTab: (tabUrl: string): string => {
        const applicationObjectTabs = applicationObjectTabsSubject.getValue();
        let pushURL = '';

        var selectedRemoved = false;

        var remainingTabs = [] as Array<ApplicationObject>;
        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            if (tab.url == tabUrl) {
                selectedRemoved = tab.isSelected;
                continue;
            }
            remainingTabs.push(tab);
        }

        if (selectedRemoved) {
            applicationObjectTabs[0].isSelected = true;
            pushURL = applicationObjectTabs[0].url;
        }

        applicationObjectTabsSubject.next([...remainingTabs]);
        return pushURL;
    },
    markAppDetailsTabActive: (url: string, parentUrl?: string) => {
        let isTabFound = false;

        const applicationObjectTabs = applicationObjectTabsSubject.getValue();

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false;
            if (tab.url === url) {
                tab.isSelected = true;
                isTabFound = true;
            }
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs]);

        return isTabFound;
    },
    markResourceDeleted: (objectKind: string, objectName: string) => {
        const applicationObjectTabs = applicationObjectTabsSubject.getValue();

        objectName = objectKind + '/...' + objectName.slice(-6);

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            if (tab.name.toLowerCase() === objectName.toLowerCase()) {
                tab.isDeleted = true;
            }
        }
        applicationObjectTabsSubject.next([...applicationObjectTabs]);
    },

    setNodeTreeActiveParentNode: (_n: iNode) => {
        _nodeTreeActiveParentNode = _n;
    },
    getNodeTreeActiveParentNode: () => {
        return _nodeTreeActiveParentNode;
    },

    setNodeTreeActiveNode: (_n: iNode) => {
        _nodeTreeActiveNode = _n;
    },

    getNodeTreeActiveNode: () => {
        return _nodeTreeActiveNode;
    },
};

export default AppDetailsStore;
