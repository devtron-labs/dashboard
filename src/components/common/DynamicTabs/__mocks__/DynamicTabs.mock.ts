import { DynamicTabType } from '../Types'

export const fixedTabsData: DynamicTabType[] = [
    {
        id: 'k8s_resources-K8s Resources',
        name: 'K8s Resources',
        url: '/resource-browser/1/all/statefulset/apps',
        isSelected: true,
        title: 'K8s Resources',
        isDeleted: false,
        positionFixed: true,
        iconPath: '/static/media/ic-object.295d09a2.svg',
    },
]

export const dynamicTabsData: DynamicTabType[] = [
    {
        id: 'k8sEmptyGroup-pod/devtron-nats-0',
        name: 'pod/devtron-nats-0',
        url: '/resource-browser/1/all/pod/k8sEmptyGroup/devtron-nats-0/manifest',
        isSelected: false,
        title: 'pod/devtron-nats-0',
        isDeleted: false,
        positionFixed: false,
    },
    {
        id: 'k8sEmptyGroup-pod/git-sensor-0',
        name: 'pod/git-sensor-0',
        url: '/resource-browser/1/all/pod/k8sEmptyGroup/git-sensor-0/manifest',
        isSelected: false,
        title: 'pod/git-sensor-0',
        isDeleted: false,
        positionFixed: false,
    },
    {
        id: 'apps-statefulset/my-release-mariadb',
        name: 'statefulset/my-release-mariadb',
        url: '/resource-browser/1/all/statefulset/apps/my-release-mariadb/manifest',
        isSelected: false,
        title: 'statefulset/my-release-mariadb',
        isDeleted: false,
        positionFixed: false,
    },
]

export const tabsData: DynamicTabType[] = [...fixedTabsData, ...dynamicTabsData]

export const persistedTabsData = {
    key: '/resource-browser',
    data: tabsData,
    resourceSelectionData: {
        pod_k8sEmptyGroup: { namespaced: true, gvk: { Group: '', Version: 'v1', Kind: 'Pod' } },
        statefulset_apps: {
            namespaced: true,
            gvk: { Group: 'apps', Version: 'v1', Kind: 'StatefulSet' },
            isGrouped: false,
        },
    },
    nodeSelectionData: {
        'pod_devtron-nats-0_k8sEmptyGroup': {
            age: '14d',
            name: 'devtron-nats-0',
            namespace: 'devtroncd',
            ready: '3/3',
            restarts: '0',
            status: 'Running',
        },
        'pod_git-sensor-0_k8sEmptyGroup': {
            age: '10d',
            name: 'git-sensor-0',
            namespace: 'devtroncd',
            ready: '1/1',
            restarts: '0',
            status: 'Running',
        },
        'statefulset_my-release-mariadb_apps': {
            age: '14d',
            name: 'my-release-mariadb',
            namespace: 'default',
            ready: '0/1',
        },
    },
}

export const mockedRemoveTabByIdentifier = jest
    .fn()
    .mockImplementation((id: string, _tabsData: DynamicTabType[]) => {
        let pushURL = ''
        let selectedRemoved = false
        const _tabs = _tabsData.filter((tab) => {
            if (tab.id === id) {
                selectedRemoved = tab.isSelected
                return false
            }
            return true
        })

        if (selectedRemoved) {
            _tabs[0].isSelected = true
            pushURL = _tabs[0].url
        }

        return {
            pushURL,
            updatedTabsData: _tabs
        }
    })

    export const mockedStopTabByIdentifier= jest
    .fn()
    .mockImplementation((title: string, _tabsData: DynamicTabType[]) => {
      let pushURL = ''
      let selectedRemoved = false
      const _tabs = _tabsData.map((tab) => {
          if (tab.title.toLowerCase() === title.toLowerCase()) {
              selectedRemoved = tab.isSelected
              return {
                  ...tab,
                  url: tab.url.split('?')[0],
                  isSelected: false,
              }
          } else return tab
      })

      if (selectedRemoved) {
          _tabs[0].isSelected = true
          pushURL = _tabs[0].url
      }
      return {
          pushURL,
          updatedTabsData: _tabs,
      }
    })