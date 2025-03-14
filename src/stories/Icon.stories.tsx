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

import type { Meta, StoryObj } from '@storybook/react'

import { Icon, iconMap, IconsProps } from '@devtron-labs/devtron-fe-common-lib'

const options = Object.keys(iconMap)

const meta = {
    component: Icon,
    argTypes: {
        name: {
            options,
            control: {
                type: 'select',
            },
        },
    },
} satisfies Meta<IconsProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        name: options[0] as IconsProps['name'],
        size: 80,
        color: null,
    },
}
