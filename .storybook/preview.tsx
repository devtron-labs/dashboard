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
} from '@devtron-labs/devtron-fe-common-lib'
import  { SwitchThemeDialog } from '../src/Pages/Shared'
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
            window._env_ = {
                FEATURE_EXPERIMENTAL_THEMING_ENABLE: true,
            } as customEnv
        }

        return (
            <ThemeProvider>
                <ConfirmationModalProvider>
                    <div id={DEVTRON_BASE_MAIN_ID}>
                        <div className="dc__border-bottom mb-10">
                            <ThemeSwitcher onChange={noop} />
                        </div>
                        <BrowserRouter>
                            <Story />
                        </BrowserRouter>
                        <ToastManagerContainer />
                    </div>

                    <SwitchThemeDialogWrapper />

                    <div id="animated-dialog-backdrop" />

                    <BaseConfirmationModal />
                </ConfirmationModalProvider>
            </ThemeProvider>
        )
    },
}

export default preview
