import { NavLink } from 'react-router-dom'

import { Icon, URLS } from '@devtron-labs/devtron-fe-common-lib'

import TextLogo from '@Icons/ic-nav-devtron.svg'
import { OrganizationFrame } from '@Pages/Shared'

export const NavigationLogo = () => {
    const { ORGANIZATION_NAME, SIDEBAR_DT_LOGO } = window._env_ ?? {}

    let logoContent: JSX.Element

    if (ORGANIZATION_NAME) {
        logoContent = <OrganizationFrame />
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
        <div className="flex left dc__gap-8 px-16 pt-12 pb-11 border__white-10--bottom">
            {showOrganizationName && <Icon name="ic-devtron" color="white" size={32} />}
            <img src={TextLogo} alt="devtron" className="navigation__expanded__logo" />
        </div>
    )
}
