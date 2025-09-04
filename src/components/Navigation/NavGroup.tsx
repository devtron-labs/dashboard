import { MouseEvent } from 'react'
import { NavLink } from 'react-router-dom'

import { Icon, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { NavGroupProps } from './types'

export const NavGroup = ({
    title,
    icon,
    isSelected,
    isExpanded,
    to,
    disabled,
    onClick,
    tooltip,
    onHover,
    showTooltip,
}: NavGroupProps) => {
    const shouldRenderNavLink = !!to

    const className = `nav-group dc__transparent px-10 py-8 ${isSelected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''} ${disabled ? 'dc__disabled' : ''}`

    const content = (
        <span className="nav-group__icon-container flex p-8 br-8">
            <Icon name={icon} color="white" size={20} />
        </span>
    )

    const handleNavLinkClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault()
            return
        }
        onClick?.(e)
    }

    return (
        <div className="flex" onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
            <Tooltip
                alwaysShowTippyOnHover={showTooltip}
                content={showTooltip ? tooltip || (disabled ? `Coming Soon - ${title}` : title) : null}
                placement="right"
                className="nav-group__tooltip no-content-padding"
            >
                {shouldRenderNavLink ? (
                    <NavLink
                        to={to}
                        className={className}
                        activeClassName="is-selected"
                        aria-disabled={disabled}
                        onClick={handleNavLinkClick}
                    >
                        {content}
                    </NavLink>
                ) : (
                    <span>
                        <button
                            type="button"
                            aria-label={title}
                            aria-disabled={disabled}
                            disabled={disabled}
                            className={className}
                            onClick={onClick}
                        >
                            {content}
                        </button>
                    </span>
                )}
            </Tooltip>
        </div>
    )
}
