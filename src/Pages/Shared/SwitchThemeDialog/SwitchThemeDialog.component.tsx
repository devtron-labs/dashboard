/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react'
import {
    ConfirmationModal,
    ConfirmationModalVariantType,
    updateUserPreferences,
    AppThemeType,
    getComponentSpecificThemeClass,
    useTheme,
    getThemePreferenceText,
    Icon,
    THEME_PREFERENCE_STORAGE_KEY,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    BaseLabelFigureProps,
    SwitchThemeDialogProps,
    ThemePreferenceLabelFigureProps,
    ThemePreferenceOptionProps,
} from './types'
import './SwitchThemeDialog.scss'

const THEME_PREFERENCE_OPTION_MAP: Record<ThemePreferenceOptionProps['value'], null> = {
    [AppThemeType.light]: null,
    [AppThemeType.dark]: null,
    auto: null,
}

const THEME_PREFERENCE_OPTION_LIST: ThemePreferenceOptionProps['value'][] = Object.keys(
    THEME_PREFERENCE_OPTION_MAP,
) as ThemePreferenceOptionProps['value'][]

const BaseLabelFigure = ({ isSelected, value, noLeftRadius = false }: BaseLabelFigureProps) => (
    <div
        className={`${isSelected ? 'br-8' : 'br-12'} ${noLeftRadius ? 'dc__no-left-radius' : ''} ${getComponentSpecificThemeClass(value)} h-100 pt-16 pl-16 border__secondary-translucent bg__tertiary dc__overflow-hidden`}
    >
        <div className="py-8 px-16 bg__primary border__primary--top border__primary--left dc__top-left-radius-8 h-100">
            <span className="cn-9 fs-24 fw-6 lh-36">Aa</span>
        </div>
    </div>
)

const ThemePreferenceLabelFigure = ({ value, isSelected }: ThemePreferenceLabelFigureProps) => {
    switch (value) {
        case AppThemeType.light:
        case AppThemeType.dark:
            return <BaseLabelFigure isSelected={isSelected} value={value} />
        case 'auto':
            return (
                <div className="theme-preference-option__auto-figure dc__grid h-100">
                    <div className="theme-preference-option__auto-figure--light">
                        <BaseLabelFigure isSelected={isSelected} value={AppThemeType.light} />
                    </div>

                    <div className="theme-preference-option__auto-figure--dark dc__zi-1">
                        <BaseLabelFigure isSelected={isSelected} value={AppThemeType.dark} noLeftRadius />
                    </div>
                </div>
            )
        default:
            return null
    }
}

const ThemePreferenceOption = ({
    selectedThemePreference,
    value,
    handleChangedThemePreference,
}: ThemePreferenceOptionProps) => {
    const handleChange = () => {
        handleChangedThemePreference(value)
    }

    const inputId = `theme-preference-option__input-${value}`
    const isSelected = value === selectedThemePreference

    return (
        <div>
            <input
                type="radio"
                id={inputId}
                name="theme-preference-option-input"
                value={value}
                checked={isSelected}
                onChange={handleChange}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={isSelected}
                className="theme-preference-option__input m-0 dc__position-abs dc__opacity-0 dc__disable-click"
            />

            <label htmlFor={inputId} className="m-0 cursor w-100">
                <div className="flexbox-col dc__gap-6 w-100">
                    <div className="h-100px-imp w-100">
                        <div
                            className={`br-12 h-100 theme-preference-option__label-container ${isSelected ? 'eb-5 bw-2 p-4' : 'theme-preference-option__label-container--hover'}`}
                        >
                            <ThemePreferenceLabelFigure value={value} isSelected={isSelected} />
                        </div>
                    </div>

                    <span className={`${isSelected ? 'cb-5' : 'cn-9'} fs-13 fw-6 lh-20`}>
                        {getThemePreferenceText(value)}
                    </span>
                </div>
            </label>
        </div>
    )
}

const SwitchThemeDialog = ({
    initialThemePreference,
    handleClose,
    currentUserPreferences,
    handleUpdateUserThemePreference,
    disableAPICalls = false,
}: SwitchThemeDialogProps) => {
    const { handleShowSwitchThemeLocationTippyChange, handleThemePreferenceChange, appTheme } = useTheme()
    const [themePreference, setThemePreference] = useState<typeof initialThemePreference>(
        !initialThemePreference ? 'auto' : initialThemePreference,
    )
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const handleSuccess = (updatedThemePreference: typeof themePreference = themePreference) => {
        handleShowSwitchThemeLocationTippyChange(!initialThemePreference)
        handleUpdateUserThemePreference(updatedThemePreference)
        handleThemePreferenceChange(updatedThemePreference)
        handleClose()
    }

    useEffect(() => {
        // Watching every 10s local storage for theme preference, if present in localStorage and no initial theme preference is provided would close the modal
        let interval: NodeJS.Timeout

        if (!initialThemePreference) {
            interval = setInterval(() => {
                const currentThemePreference = localStorage.getItem(
                    THEME_PREFERENCE_STORAGE_KEY,
                ) as typeof themePreference

                if (currentThemePreference) {
                    handleSuccess(currentThemePreference)
                }
            }, 10000)
        }

        return () => {
            clearInterval(interval)
        }
    }, [])

    const handleSaveThemePreference = async () => {
        setIsSaving(true)

        if (!disableAPICalls) {
            const isSuccessful = await updateUserPreferences({ ...currentUserPreferences, themePreference, appTheme })
            if (isSuccessful) {
                handleSuccess()
            }
        } else {
            handleSuccess()
        }
        setIsSaving(false)
    }

    const handleChangedThemePreference: ThemePreferenceOptionProps['handleChangedThemePreference'] = (value) => {
        handleThemePreferenceChange(value, true)
        setThemePreference(value)
    }

    const handleCloseModal = () => {
        handleThemePreferenceChange(initialThemePreference, true)
        handleClose()
    }

    return (
        <ConfirmationModal
            title="Customize your theme"
            subtitle="Select a theme that suits your preference"
            variant={ConfirmationModalVariantType.custom}
            handleClose={!initialThemePreference ? null : handleCloseModal}
            shouldCloseOnEscape={!!initialThemePreference}
            Icon={<Icon name="ic-medium-paintbucket" color={null} size={48} />}
            buttonConfig={{
                primaryButtonConfig: {
                    isLoading: isSaving,
                    text: 'Save Preference',
                    onClick: handleSaveThemePreference,
                    disabled: !themePreference,
                },
            }}
            isLandscapeView
        >
            <div className="dc__grid dc__column-gap-16 theme-preference-option__container">
                {THEME_PREFERENCE_OPTION_LIST.map((value) => (
                    <ThemePreferenceOption
                        key={value}
                        value={value}
                        selectedThemePreference={themePreference}
                        handleChangedThemePreference={handleChangedThemePreference}
                    />
                ))}
            </div>
        </ConfirmationModal>
    )
}

export default SwitchThemeDialog
