import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Progressing } from '@Common/Progressing'
import { Tooltip } from '@Common/Tooltip'
import { TooltipProps } from '@Common/Tooltip/types'
import { ComponentSizeType } from '@Shared/constants'
import { ButtonComponentType, ButtonProps, ButtonStyleType, ButtonVariantType } from './types'
import { getButtonDerivedClass, getButtonIconClassName, getButtonLoaderSize } from './utils'
import './button.scss'

const ButtonElement = ({
    component = ButtonComponentType.button,
    linkProps,
    buttonProps,
    onClick,
    ...props
}: PropsWithChildren<
    Omit<
        ButtonProps,
        | 'text'
        | 'variant'
        | 'size'
        | 'style'
        | 'startIcon'
        | 'endIcon'
        | 'showTooltip'
        | 'tooltipProps'
        | 'dataTestId'
        | 'isLoading'
        | 'ariaLabel'
        | 'showAriaLabelInTippy'
    > & {
        className: string
        'data-testid': ButtonProps['dataTestId']
        'aria-label': ButtonProps['ariaLabel']
    }
>) => {
    if (component === ButtonComponentType.link) {
        return (
            <Link
                {...linkProps}
                {...props}
                // Added the specific class to ensure that the link override is applied
                className={`${props.className} button__link ${props.disabled ? 'dc__disable-click' : ''}`}
                onClick={onClick as LinkProps['onClick']}
            />
        )
    }

    return (
        <button
            {...buttonProps}
            {...props}
            // eslint-disable-next-line react/button-has-type
            type={buttonProps?.type || 'button'}
            onClick={onClick as ButtonHTMLAttributes<HTMLButtonElement>['onClick']}
        />
    )
}

/**
 * Generic component for Button.
 * Should be used in combination of variant, size and style.
 *
 * @example Default button
 * ```tsx
 * <Button text="Hello World"  />
 * ```
 *
 * @example Custom variant
 * ```tsx
 * <Button text="Hello World" variant={ButtonVariantType.secondary}  />
 * ```
 *
 * @example Custom size
 * ```tsx
 * <Button text="Hello World" size={ComponentSizeType.medium}  />
 * ```
 *
 * @example Custom style
 * ```tsx
 * <Button text="Hello World" style={ButtonStyleType.positive}  />
 * ```
 *
 * @example Disabled state
 * ```tsx
 * <Button text="Hello World" disabled  />
 * ```
 *
 * @example Loading state
 * ```tsx
 * <Button text="Hello World" isLoading  />
 * ```
 *
 * @example With start icon
 * ```tsx
 * <Button text="Hello World" startIcon={<ICCube />}  />
 * ```
 *
 * @example With end icon
 * ```tsx
 * <Button text="Hello World" endIcon={<ICCube />}  />
 * ```
 *
 * @example With tippy
 * ```tsx
 * <Button text="Hello World" showTippy tippyContent="Tippy content"  />
 * ```
 *
 * @example With onClick
 * ```tsx
 * <Button text="Hello World" onClick={noop}  />
 * ```
 *
 * @example Link component
 * ```tsx
 * <Button component={ButtonComponentType.link} linkProps={{ to: '#' }} />
 * ```
 *
 * @example Icon button
 * ```tsx
 * <Button icon={<ICCube />} ariaLabel="Label" />
 * ```
 */
const Button = ({
    dataTestId,
    text,
    variant = ButtonVariantType.primary,
    size = ComponentSizeType.large,
    style = ButtonStyleType.default,
    startIcon = null,
    endIcon = null,
    disabled = false,
    isLoading = false,
    showTooltip = false,
    tooltipProps = {},
    icon = null,
    ariaLabel = null,
    showAriaLabelInTippy = true,
    ...props
}: ButtonProps) => {
    const isDisabled = disabled || isLoading
    const iconClass = `dc__no-shrink flex dc__fill-available-space ${getButtonIconClassName({
        size,
        icon,
    })}`

    const getTooltipProps = (): TooltipProps => {
        // Show the aria label as tippy only if the action based tippy is not to be shown
        if (!showTooltip && showAriaLabelInTippy && icon && ariaLabel) {
            return {
                alwaysShowTippyOnHover: true,
                content: ariaLabel,
            }
        }

        if (Object.hasOwn(tooltipProps, 'shortcutKeyCombo') && 'shortcutKeyCombo' in tooltipProps) {
            return tooltipProps
        }

        return {
            // TODO: using some typing somersaults here, clean it up later
            alwaysShowTippyOnHover: showTooltip && !!(tooltipProps as Required<Pick<TooltipProps, 'content'>>)?.content,
            ...(tooltipProps as Required<Pick<TooltipProps, 'content'>>),
        }
    }

    return (
        <Tooltip {...getTooltipProps()}>
            <div>
                <ButtonElement
                    {...props}
                    disabled={isDisabled}
                    className={`br-4 flex cursor dc__tab-focus dc__position-rel dc__capitalize ${getButtonDerivedClass({ size, variant, style, isLoading, icon })} ${isDisabled ? 'dc__disabled' : ''}`}
                    data-testid={dataTestId}
                    aria-label={ariaLabel}
                >
                    {icon ? (
                        <span className={iconClass}>{icon}</span>
                    ) : (
                        <>
                            {startIcon && <span className={iconClass}>{startIcon}</span>}
                            <span className="dc__align-left">{text}</span>
                            {endIcon && <span className={iconClass}>{endIcon}</span>}
                        </>
                    )}
                    {isLoading && (
                        <Progressing
                            size={getButtonLoaderSize({
                                size,
                                icon,
                            })}
                        />
                    )}
                </ButtonElement>
            </div>
        </Tooltip>
    )
}

export default Button
