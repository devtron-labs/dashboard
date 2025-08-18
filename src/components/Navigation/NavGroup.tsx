import { NavLink } from 'react-router-dom'

import { Icon, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { NavGroupProps } from './types'

export const NavGroup = ({ title, icon, isSelected, isExpanded, to, onClick }: NavGroupProps) => {
    const shouldRenderNavLink = !!to

    const className = `nav-group dc__transparent px-10 py-8 dc__position-rel ${isSelected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''}`

    const content = (
        <>
            <span className="nav-group__icon-container flex p-8 br-8">
                <Icon name={icon} color="white" size={20} />
            </span>
            <span className="nav-group__divider-container dc__position-abs dc__left-0 dc__bottom-0 flex w-100">
                <span className="border__sidenav-primary--bottom w-24" />
            </span>
        </>
    )

    return (
        <Tooltip alwaysShowTippyOnHover content={title} placement="bottom">
            {shouldRenderNavLink ? (
                <NavLink to={to} className={className} activeClassName="is-selected">
                    {content}
                </NavLink>
            ) : (
                <button type="button" aria-label={title} className={className} onClick={onClick}>
                    {content}
                </button>
            )}
        </Tooltip>
    )
}
