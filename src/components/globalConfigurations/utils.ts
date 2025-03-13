import { URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'

export const getShouldHidePageHeaderAndSidebar = (pathname: string) =>
    !!new RegExp(CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL.replace(':appId', '')).test(pathname)
