import {
    BUTTON_SIZE_TO_CLASS_NAME_MAP,
    BUTTON_SIZE_TO_ICON_SIZE_MAP,
    ICON_BUTTON_SIZE_TO_CLASS_NAME_MAP,
    ICON_BUTTON_SIZE_TO_ICON_SIZE_MAP,
} from './constants'
import { ButtonProps } from './types'

export const getButtonIconClassName = ({ size, icon }: Pick<ButtonProps, 'size' | 'icon'>) => {
    const iconSize = icon ? ICON_BUTTON_SIZE_TO_ICON_SIZE_MAP[size] : BUTTON_SIZE_TO_ICON_SIZE_MAP[size]

    return `icon-dim-${iconSize}`
}

export const getButtonLoaderSize = ({ size, icon }: Pick<ButtonProps, 'size' | 'icon'>) => {
    if (icon) {
        return ICON_BUTTON_SIZE_TO_ICON_SIZE_MAP[size]
    }

    return BUTTON_SIZE_TO_ICON_SIZE_MAP[size]
}

export const getButtonDerivedClass = ({
    size,
    variant,
    style,
    isLoading,
    icon,
}: Pick<ButtonProps, 'variant' | 'size' | 'style' | 'isLoading' | 'icon'>) =>
    `button button__${variant}--${style} ${icon ? ICON_BUTTON_SIZE_TO_CLASS_NAME_MAP[size] : BUTTON_SIZE_TO_CLASS_NAME_MAP[size]} ${isLoading ? 'button--loading' : ''}`
