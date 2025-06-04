import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/css/application.scss'
import { BrowserRouter } from 'react-router-dom'
import {
    ThemeProvider,
    ToastManagerContainer,
    ThemeSwitcher,
    noop,
    customEnv,
    DEVTRON_BASE_MAIN_ID,
    ConfirmationModalProvider,
    BaseConfirmationModal,
    useTheme,
    SwitchThemeDialog,
} from '@devtron-labs/devtron-fe-common-lib'
import './storybook.css'

const SwitchThemeDialogWrapper = () => {
    const { showThemeSwitcherDialog, themePreference, handleThemeSwitcherDialogVisibilityChange } = useTheme()
    const handleClose = () => {
        handleThemeSwitcherDialogVisibilityChange(false)
    }

    return (
        showThemeSwitcherDialog ? <SwitchThemeDialog initialThemePreference={themePreference} handleClose={handleClose} disableAPICalls handleUpdateUserThemePreference={noop} /> : null
    )
}

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: (Story) => {
        if (!window._env_) {
            window._env_ = {} as customEnv
        }

        return (
            <ThemeProvider>
                <ConfirmationModalProvider>
                    <div id={DEVTRON_BASE_MAIN_ID}>
                        <div className="dc__border-bottom mb-10">
                            <ThemeSwitcher />
                        </div>
                        <BrowserRouter>
                            <Story />
                        </BrowserRouter>
                        <ToastManagerContainer />
                    </div>

                    <SwitchThemeDialogWrapper />

                    <div id="animated-dialog-backdrop" />
                    <div id="visible-modal" />

                    <BaseConfirmationModal />
                </ConfirmationModalProvider>
            </ThemeProvider>
        )
    },
}

export default preview
