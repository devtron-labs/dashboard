import { LinkProps, NavLinkProps } from 'react-router-dom'

import { ComponentSizeType } from '@Shared/constants'
import { DataAttributes } from '@Shared/types'
import { TooltipProps } from '@Common/Tooltip/types'

type TabComponentProps<TabTypeProps> = TabTypeProps & DataAttributes

type ConditionalTabType =
    | {
          /**
           * Type of the tab, either `button`, `link`, `navLink` or `block`.
           */
          tabType: 'button'
          /**
           * Props passed to button component.
           */
          props?: TabComponentProps<Omit<React.ComponentProps<'button'>, 'className' | 'style'>>
          /**
           * Indicates if the tab is currently active.
           */
          active?: boolean
      }
    | {
          /**
           * Type of the tab, either `button`, `link`, `navLink` or `block`.
           */
          tabType: 'navLink'
          /**
           * Props passed to nav link component.
           */
          props: TabComponentProps<Omit<NavLinkProps, 'className' | 'style' | 'activeClassName'>>
          /**
           * Active state is determined by matching the URL.
           */
          active?: never | false
      }
    | {
          /**
           * Type of the tab, either `button`, `link`, `navLink` or `block`.
           */
          tabType: 'link'
          /**
           * Props passed to link component.
           */
          props: TabComponentProps<Omit<LinkProps, 'className' | 'style'>>
          /**
           * Indicates if the tab is currently active.
           */
          active?: boolean
      }
    | {
          /**
           * Type of the tab, either `button`, `link`, `navLink` or `block`.
           * @note When `tabType` is set to `block`, the tab becomes non-interactive. It won't be active and will not have hover states.
           */
          tabType: 'block'
          /**
           * Props passed to div component.
           */
          props?: TabComponentProps<Omit<React.ComponentProps<'div'>, 'className' | 'style'>>
          /**
           * Indicates if the tab is currently active.
           */
          active?: never | false
      }

type TabTooltipProps =
    | {
          shouldWrapTooltip: boolean
          tooltipProps: TooltipProps
      }
    | {
          shouldWrapTooltip?: never
          tooltipProps?: never
      }

export type TabProps = {
    /**
     * Unique identifier for the tab.
     */
    id: string | number
    /**
     * Text label for the tab.
     */
    label: string
    /**
     * Description for the tab.
     * @note - If passed as a `string[]`, it will be rendered with a bullet in-between strings.
     */
    description?: string | string[]
    /**
     * Icon component to be displayed in the tab.
     * This should be a functional component that renders an SVG.
     */
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    /**
     * Badge number to be displayed on the tab, typically for notifications.
     */
    badge?: number
    /**
     * Indicates if an indicator should be shown on the tab.
     */
    showIndicator?: boolean
    /**
     * Indicates if a warning state should be displayed on the tab.
     * @note error state will take precedence over warning state.
     */
    showWarning?: boolean
    /**
     * Indicates if an error state should be displayed on the tab.
     * @note error state will take precedence over warning state.
     */
    showError?: boolean
    /**
     * Disables the tab, preventing interaction and indicating an inactive state.
     */
    disabled?: boolean
} & ConditionalTabType &
    TabTooltipProps

export interface TabGroupProps {
    /**
     * Array of tabs to be rendered.
     */
    tabs: TabProps[]
    /**
     * Size of the tabs.
     * @default ComponentSizeType.large
     */
    size?: ComponentSizeType.large | ComponentSizeType.medium | ComponentSizeType.xl
    /**
     * Optional component to be rendered on the right side of the tab list.
     */
    rightComponent?: React.ReactElement
    /**
     * Set to `true` to align the active tab's border with the bottom border of the parent container.
     * @default false
     */
    alignActiveBorderWithContainer?: boolean
    /**
     * Determines if the top padding of the tab group should be hidden.
     * @default false
     */
    hideTopPadding?: boolean
}
