import { NavLink } from 'react-router-dom'

import { getRandomColor, Icon, ROUTER_URLS, SERVER_MODE, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import TextLogo from '@Icons/ic-nav-devtron.svg'

export const NavigationLogo = () => {
    const { ORGANIZATION_NAME, SIDEBAR_DT_LOGO } = window._env_ ?? {}
    const { serverMode } = useMainContext()

    let logoContent: JSX.Element

    if (ORGANIZATION_NAME) {
        const backgroundColor = getRandomColor(ORGANIZATION_NAME)
        logoContent = (
            <span className="flex dc__position-rel">
                <span className="icon-dim-24 flex px-2 border__white bw-2 br-4" style={{ backgroundColor }}>
                    <span className="fs-12 lh-16 fw-6 text__sidenav">
                        {ORGANIZATION_NAME.slice(0, 2).toUpperCase()}
                    </span>
                </span>
                <span
                    className="navigation__small-dt-logo flex br-8 dc__position-abs dc__overflow-hidden"
                    style={{ backgroundColor }}
                >
                    <Icon name="ic-devtron" color="white" />
                </span>
            </span>
        )
    } else if (SIDEBAR_DT_LOGO) {
        logoContent = <img src={SIDEBAR_DT_LOGO} alt="devtron" className="icon-dim-40" width={40} height={40} />
    } else {
        logoContent = <Icon name="ic-devtron" color="white" size={28} />
    }

    return (
        <NavLink
            className="flex"
            to={
                serverMode === SERVER_MODE.EA_ONLY
                    ? ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST.HELM
                    : ROUTER_URLS.DEVTRON_APP_LIST
            }
        >
            {logoContent}
        </NavLink>
    )
}

export const NavigationLogoExpanded = () => {
    const showOrganizationName = !!window._env_.ORGANIZATION_NAME

    return (
        <div
            className={`flex left dc__gap-8 px-16 border__sidenav-secondary--bottom ${showOrganizationName ? 'pt-14 pb-13' : 'pt-20 pb-19'}`}
        >
            {showOrganizationName && <Icon name="ic-devtron" color="white" size={28} />}
            <img src={TextLogo} alt="devtron" width={76} height={16} />
        </div>
    )
}
