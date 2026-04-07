import {
    GenericModal,
    Icon,
    Illustration,
    IS_PLATFORM_MAC_OS,
    KeyboardShortcut,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { NavigationUpgradedDialogProps } from './types'

const NavigationUpgradedDialog = ({ isOpen, onClose }: NavigationUpgradedDialogProps) => {
    const { appTheme } = useTheme()

    return (
        <GenericModal
            name="nav-upgraded"
            onClose={onClose}
            onEscape={onClose}
            open={isOpen}
            avoidFocusTrap
            closeOnBackdropClick
            borderVariant={appTheme === 'dark' ? 'secondary-translucent' : 'none'}
            alignCenter
        >
            <Illustration name="cmd-bar-visual" />
            <div className="flex column px-32 py-36 dc__gap-20">
                <div className="flex dc__gap-16">
                    <Icon name="ic-nav-cursor" size={48} color={null} />
                    <div className="dc__fill-available-space">
                        <Icon name="ic-curved-arrow" color={null} />
                    </div>
                    <div className="flex dc__gap-8">
                        <kbd className="p-8 cn-7 lh-48 flex bg__primary border__primary br-8 shadow__key fs-32 dc__no-shrink mw-20 icon-dim-48 fw-5">
                            {IS_PLATFORM_MAC_OS ? '⌘' : 'Ctrl'}
                        </kbd>
                        <kbd className="p-8 cn-7 lh-48 flex bg__primary border__primary br-8 shadow__key fs-32 dc__no-shrink mw-20 icon-dim-48 fw-5">
                            K
                        </kbd>
                    </div>
                </div>
                <div className="flex column dc__gap-8">
                    <span className="fs-24 lh1-5 cn-9 fw-7 font-merriweather">Navigation got an upgrade</span>
                    <span className="fs-16 lh1-5 cn-9 fw-4">
                        Things may look a little different, but should be easier to find.
                    </span>
                </div>
            </div>
            <div className="flex py-12 border__secondary--top bg__modal--secondary">
                <span>Hit</span>&nbsp;
                <KeyboardShortcut keyboardKey={IS_PLATFORM_MAC_OS ? 'Meta' : 'Control'} />
                &nbsp;
                <KeyboardShortcut keyboardKey="K" />
                &nbsp;
                <span>on the keyboard or click Search to find anything instantly</span>
            </div>
        </GenericModal>
    )
}

export default NavigationUpgradedDialog
