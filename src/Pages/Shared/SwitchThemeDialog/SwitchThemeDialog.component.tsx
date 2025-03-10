import { useState } from 'react'
import {
    ConfirmationModal,
    ConfirmationModalVariantType,
    updateUserPreferences,
    getAppThemeForAutoPreference,
    AppThemeType,
    getComponentSpecificThemeClass,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    BaseLabelFigureProps,
    SwitchThemeDialogProps,
    ThemePreferenceLabelFigureProps,
    ThemePreferenceOptionProps,
} from './types'
import './SwitchThemeDialog.scss'
import { getThemePreferenceText } from './utils'

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
        className={`${isSelected ? 'br-8' : 'br-12'} ${noLeftRadius ? 'dc__no-left-radius' : ''} ${getComponentSpecificThemeClass(value)} h-100 pt-16 pl-16 border__secondary-translucent bg__tertiary`}
    >
        <div className="py-8 px-16 border__primary--top border__primary--left dc__top-left-radius h-100">
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
                className="theme-preference-option__input m-0 dc__position-abs dc__opacity-0 dc__disable-click"
            />

            <label htmlFor={inputId} className="m-0 cursor w-100">
                <div className="flexbox-col dc__gap-6 w-100">
                    <div className="h-100px-imp w-100">
                        <div className={`br-12 h-100 ${isSelected ? 'eb-5 bw-1 p-4' : ''}`}>
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

const SwitchThemeDialog = ({ initialThemePreference, handleClose, currentUserPreferences }: SwitchThemeDialogProps) => {
    const [themePreference, setThemePreference] = useState<typeof initialThemePreference>(initialThemePreference)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const handleSaveThemePreference = async () => {
        setIsSaving(true)
        const isSuccessful = await updateUserPreferences({ ...currentUserPreferences, themePreference })
        if (isSuccessful) {
            handleClose()
        }
        setIsSaving(false)
    }

    const handleChangedThemePreference: ThemePreferenceOptionProps['handleChangedThemePreference'] = (value) => {
        setThemePreference(value)
    }

    return (
        <ConfirmationModal
            title="Appearance"
            subtitle="Choose an interface theme preference"
            variant={ConfirmationModalVariantType.custom}
            handleClose={!initialThemePreference ? null : handleClose}
            shouldCloseOnEscape={!initialThemePreference}
            buttonConfig={{
                primaryButtonConfig: {
                    isLoading: isSaving,
                    text: 'Save Preference',
                    onClick: handleSaveThemePreference,
                    // In case of error initialThemePreference will be null
                    disabled: !themePreference,
                },
            }}
            overriddenTheme={themePreference === 'auto' ? getAppThemeForAutoPreference() : themePreference}
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
