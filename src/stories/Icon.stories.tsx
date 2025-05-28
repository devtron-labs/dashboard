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

import { Icon, iconMap, IconsProps, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

const icons = Object.keys(iconMap) as (keyof typeof iconMap)[]

const IconRenderer = ({ color, ...props }: Omit<Partial<IconsProps>, 'name'>) => (
    <div
        className="dc__grid dc__gap-12"
        style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        }}
    >
        {icons.map((icon) => (
            <div key={icon} className="flexbox-col text-center dc__gap-4 bg__primary px-4 py-2">
                <Icon name={icon} color={color} size={80} {...props} />
                <Tooltip content={icon}>
                    <p className="m-0 fs-12 lh-18 cn-9 dc__ellipsis-right">{icon}</p>
                </Tooltip>
            </div>
        ))}
    </div>
)

const meta = {
    component: IconRenderer,
    argTypes: {
        color: {
            control: 'text',
            type: 'string',
            table: {
                defaultValue: null,
            },
        },
    },
} satisfies Meta<IconsProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}
