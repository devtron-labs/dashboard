import { KEYBOARD_KEYS_MAP, TooltipProps } from './types'

const ShortcutKeyComboTooltipContent = ({ text, combo }: TooltipProps['shortcutKeyCombo']) => (
    <div className="flexbox dc__gap-8 px-8 py-4 flex-wrap">
        <span className="lh-18 fs-12 fw-4 cn-0">{text}</span>
        {!!combo?.length && (
            <div className="flexbox dc__gap-4 dc__align-items-center flex-wrap">
                {combo.map((key) => (
                    <span key={key} className="shortcut-keys__chip dc__capitalize lh-16 fs-11 fw-5 flex">
                        {KEYBOARD_KEYS_MAP[key]}
                    </span>
                ))}
            </div>
        )}
    </div>
)

export default ShortcutKeyComboTooltipContent
