import { useState, cloneElement } from 'react'
import TippyJS from '@tippyjs/react'
import { TooltipProps } from './types'
import ShortcutKeyComboTooltipContent from './ShortcutKeyComboTooltipContent'
import './styles.scss'

const Tooltip = ({
    shortcutKeyCombo,
    alwaysShowTippyOnHover,
    // NOTE: if alwaysShowTippyOnHover or shortcutKeyCombo are being passed by user don't apply truncation logic at all
    showOnTruncate = alwaysShowTippyOnHover === undefined && shortcutKeyCombo === undefined,
    wordBreak = true,
    children: child,
    ...rest
}: TooltipProps) => {
    const [isTextTruncated, setIsTextTruncated] = useState(false)

    const handleMouseEnterEvent: React.MouseEventHandler = (event) => {
        const { currentTarget: node } = event
        const isTextOverflowing = node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight
        if (isTextOverflowing && !isTextTruncated) {
            setIsTextTruncated(true)
        } else if (!isTextOverflowing && isTextTruncated) {
            setIsTextTruncated(false)
        }
    }

    const showTooltipWhenShortcutKeyComboProvided =
        !!shortcutKeyCombo && (alwaysShowTippyOnHover === undefined || alwaysShowTippyOnHover)
    const showTooltipOnTruncate = showOnTruncate && isTextTruncated

    return showTooltipOnTruncate || showTooltipWhenShortcutKeyComboProvided || alwaysShowTippyOnHover ? (
        <TippyJS
            arrow={false}
            placement="top"
            // NOTE: setting the default maxWidth to empty string so that we can override using css
            maxWidth=""
            {...rest}
            {...(shortcutKeyCombo ? { content: <ShortcutKeyComboTooltipContent {...shortcutKeyCombo} /> } : {})}
            className={`${shortcutKeyCombo ? 'shortcut-keys__tippy' : 'default-tt'} ${wordBreak ? 'dc__word-break' : ''} dc__mxw-200 ${rest.className ?? ''}`}
        >
            {cloneElement(child, { ...child.props, onMouseEnter: handleMouseEnterEvent })}
        </TippyJS>
    ) : (
        cloneElement(child, { ...child.props, onMouseEnter: handleMouseEnterEvent })
    )
}

export default Tooltip
