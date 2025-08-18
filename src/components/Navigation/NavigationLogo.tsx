import { NavLink } from 'react-router-dom'

import { getRandomColor, Icon, URLS } from '@devtron-labs/devtron-fe-common-lib'

import TextLogo from '@Icons/ic-nav-devtron.svg'

export const NavigationLogo = () => {
    const { ORGANIZATION_NAME, SIDEBAR_DT_LOGO } = window._env_ ?? {}

    let logoContent: JSX.Element

    if (ORGANIZATION_NAME) {
        const backgroundColor = getRandomColor(ORGANIZATION_NAME)
        logoContent = (
            <span className="flex dc__position-rel">
                <span className="icon-dim-24 flex px-2 border__white bw-2 br-4" style={{ backgroundColor }}>
                    <span className="fs-12 lh-16 fw-6 text__sidenav">
                        {ORGANIZATION_NAME.slice(0, 2).toLocaleUpperCase()}
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
        logoContent = <Icon name="ic-devtron" color="white" size={40} />
    }

    return (
        <NavLink className="flex" to={URLS.APP}>
            {logoContent}
        </NavLink>
    )
}

export const NavigationLogoExpanded = () => {
    const showOrganizationName = !!window._env_.ORGANIZATION_NAME

    return (
        <div className="flex left dc__gap-8 px-16 pt-12 pb-11 border__sidenav-secondary--bottom">
            {showOrganizationName && <Icon name="ic-devtron" color="white" size={32} />}
            <img src={TextLogo} alt="devtron" className="navigation__expanded__logo" />
        </div>
    )
}
