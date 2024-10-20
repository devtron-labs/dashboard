import { TooltipProps } from '@Common/Tooltip/types'
import { ComponentSizeType } from '@Shared/constants'
import { ButtonHTMLAttributes, ReactElement } from 'react'
import { LinkProps } from 'react-router-dom'

// Using the same for BEM class elements
export enum ButtonVariantType {
    primary = 'primary',
    secondary = 'secondary',
    borderLess = 'border-less',
    text = 'text',
}

export enum ButtonStyleType {
    default = 'default',
    negative = 'negative',
    negativeGrey = 'negative-grey',
    positive = 'positive',
    warning = 'warning',
    neutral = 'neutral',
}

export enum ButtonComponentType {
    button = 'button',
    link = 'link',
}

export type ButtonProps = (
    | {
          /**
           * Component to be rendered from the available options
           *
           * @default ButtonComponentType.button
           */
          component?: ButtonComponentType.button | never
          /**
           * Props for the button component
           */
          buttonProps?: Omit<
              ButtonHTMLAttributes<HTMLButtonElement>,
              'children' | 'styles' | 'className' | 'disabled' | 'onClick'
          >
          linkProps?: never
          onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
      }
    | {
          component: ButtonComponentType.link
          /**
           * Props for the link component
           */
          linkProps: Omit<LinkProps, 'children' | 'styles' | 'className' | 'onClick'>
          buttonProps?: never
          onClick?: LinkProps['onClick']
      }
) & {
    /**
     * Variant of the button
     *
     * @default ButtonVariantType.primary
     */
    variant?: ButtonVariantType
    /**
     * Size of the button
     *
     * @default ComponentSizeType.large
     */
    size?: ComponentSizeType
    /**
     * Style to be applied on the button
     *
     * @default ButtonStyleType.default
     */
    style?: ButtonStyleType
    /**
     * If true, the loading state is shown for the button with disabled
     */
    isLoading?: boolean
    /**
     * Test id for the component
     */
    dataTestId: string
    /**
     * If true, the button is disabled
     *
     * @default false
     */
    disabled?: boolean
} & (
        | {
              /**
               * If true, the tooltip is shown for the button
               */
              showTooltip: boolean
              /**
               * Props for tooltip
               */
              // TODO: using some typing somersaults here, clean it up later
              tooltipProps:
                  | Omit<TooltipProps, 'alwaysShowTippyOnHover' | 'showOnTruncate' | 'shortcutKeyCombo'>
                  | (Omit<TooltipProps, 'alwaysShowTippyOnHover' | 'showOnTruncate' | 'content'> &
                        Required<Pick<TooltipProps, 'shortcutKeyCombo'>>)
          }
        | {
              showTooltip?: never
              tooltipProps?: never
          }
    ) &
    (
        | {
              icon?: never
              ariaLabel?: never
              showAriaLabelInTippy?: never
              /**
               * Text to be displayed in the button
               */
              text: string
              /**
               * If provided, icon to be displayed at the start of the button
               */
              startIcon?: ReactElement
              /**
               * If provided, icon to be displayed at the end of the button
               */
              endIcon?: ReactElement
          }
        | {
              /**
               * If provided, icon button is rendered
               */
              icon: ReactElement
              /**
               * If false, the ariaLabel is not shown in tippy
               *
               * @default true
               */
              showAriaLabelInTippy?: boolean
              /**
               * Label for the icon button for accessibility.
               * Shown on hover in tooltip if tippy is not provided explicitly
               */
              ariaLabel: string
              text?: never
              startIcon?: never
              endIcon?: never
          }
    )
