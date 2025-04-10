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

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BaseConfigurationNavigationProps } from './types'

const BaseConfigurationNavigation = ({ baseConfigurationURL }: BaseConfigurationNavigationProps) => (
    <Button
        dataTestId="base-configuration-navigation"
        component={ButtonComponentType.link}
        linkProps={{
            to: baseConfigurationURL,
        }}
        text="Base Configuration"
        variant={ButtonVariantType.text}
        style={ButtonStyleType.neutral}
        size={ComponentSizeType.xs}
    />
)

export default BaseConfigurationNavigation
