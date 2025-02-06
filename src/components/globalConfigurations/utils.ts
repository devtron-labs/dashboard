import { URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'

export const getShouldHidePageHeaderAndSidebar = (pathname: string) =>
    !!pathname.match(new RegExp(`${CommonURLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP}/[0-9]+`))?.length
