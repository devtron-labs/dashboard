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
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import {
    CustomInputProps,
    DEFAULT_SECRET_PLACEHOLDER,
    PasswordField,
    PasswordFieldProps,
} from '@devtron-labs/devtron-fe-common-lib'

const meta = {
    component: PasswordField,
} satisfies Meta<CustomInputProps | PasswordFieldProps>

export default meta
type Story = StoryObj<typeof meta>

const PasswordFieldTemplate: Story = {
    render: (props) => {
        const [value, setValue] = useState<CustomInputProps['value']>(props.value)

        useEffect(() => {
            setValue(props.value)
        }, [props.value])

        const handleChange: CustomInputProps['onChange'] = (e) => {
            setValue(e.target.value)
            action('changed')(e)
        }

        return <PasswordField {...props} value={value} onChange={handleChange} />
    },
    args: {
        name: 'password-field',
        label: 'Password',
        value: '',
        placeholder: 'Enter password',
        onChange: null,
        shouldShowDefaultPlaceholderOnBlur: false,
    },
}

export const DoNotShowDefaultPlaceholderOnBlur: Story = {
    ...PasswordFieldTemplate,
}

export const ShowDefaultPlaceholderOnBlur: Story = {
    ...PasswordFieldTemplate,
    args: {
        ...PasswordFieldTemplate.args,
        shouldShowDefaultPlaceholderOnBlur: true,
        value: DEFAULT_SECRET_PLACEHOLDER,
    },
}
