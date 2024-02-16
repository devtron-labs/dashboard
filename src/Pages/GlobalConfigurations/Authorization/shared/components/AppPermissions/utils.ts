import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../../../../../config'

export const getNavLinksConfig = (serverMode: SERVER_MODE, superAdmin: boolean) =>
    [
        {
            tabName: 'devtron-apps',
            label: 'Devtron Apps',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            tabName: 'helm-apps',
            label: 'Helm Apps',
            isHidden: false,
        },
        {
            tabName: 'jobs',
            label: 'Jobs',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
        {
            tabName: 'kubernetes-objects',
            label: 'Kubernetes Resources',
            isHidden: !superAdmin,
        },
        {
            tabName: 'chart-groups',
            label: 'Chart Groups',
            isHidden: serverMode === SERVER_MODE.EA_ONLY,
        },
    ] as const

export const getAppPermissionDetailConfig = (path: string, serverMode: SERVER_MODE) =>
    [
        {
            id: 'devtron-apps',
            url: `${path}/devtron-apps`,
            accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
            shouldRender: serverMode !== SERVER_MODE.EA_ONLY,
        },
        {
            id: 'helm-apps',
            url: `${path}/helm-apps`,
            accessType: ACCESS_TYPE_MAP.HELM_APPS,
            shouldRender: true,
        },
        {
            id: 'jobs',
            url: `${path}/jobs`,
            accessType: ACCESS_TYPE_MAP.JOBS,
            shouldRender: serverMode !== SERVER_MODE.EA_ONLY,
        },
    ] as const
