import { MouseEventHandler, MutableRefObject, ReactNode } from 'react'
import { NavLinkProps } from 'react-router-dom'

import { NavigationGroupType, NavigationItemType, SERVER_MODE } from '@devtron-labs/devtron-fe-common-lib'

import { ViewType } from '@Config/constants'

export interface NavGroupProps extends Pick<NavigationGroupType, 'icon' | 'title' | 'disabled'> {
    isExpanded?: boolean
    isSelected?: boolean
    to?: NavLinkProps['to']
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
    showTooltip?: boolean
    tooltip?: ReactNode
    onHover?: (isHovered: boolean) => void
}

export type NavItemProps = NavigationItemType & {
    hasSearchText: boolean
}

export interface NavigationProps {
    showStackManager?: boolean
    isAirgapped: boolean
    serverMode: SERVER_MODE
    moduleInInstallingState: string
    installedModuleMap: MutableRefObject<Record<string, boolean>>
    pageState: ViewType
}
