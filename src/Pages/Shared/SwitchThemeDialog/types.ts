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

import { AppThemeType, useTheme } from '@devtron-labs/devtron-fe-common-lib'

type ThemePreferenceType = ReturnType<typeof useTheme>['themePreference']

export type SwitchThemeDialogProps = {
    /**
     * @description The initial theme preference of the user fetched from api, in case of error would be null
     */
    initialThemePreference: ThemePreferenceType
    handleUpdateUserThemePreference: (themePreference: ThemePreferenceType) => void
    handleClose: () => void
} & (
    | {
          /**
           * @default false
           * @description Required for storybook
           */
          disableAPICalls?: false
      }
    | {
          currentUserPreferences?: never
          disableAPICalls: true
      }
)

export interface ThemePreferenceOptionProps {
    selectedThemePreference: SwitchThemeDialogProps['initialThemePreference']
    value: SwitchThemeDialogProps['initialThemePreference']
    handleChangedThemePreference: (themePreference: SwitchThemeDialogProps['initialThemePreference']) => void
}

export interface ThemePreferenceLabelFigureProps extends Pick<ThemePreferenceOptionProps, 'value'> {
    isSelected: boolean
}

export interface BaseLabelFigureProps extends Pick<ThemePreferenceLabelFigureProps, 'isSelected'> {
    value: AppThemeType
    /**
     * @default false
     */
    noLeftRadius?: boolean
}
