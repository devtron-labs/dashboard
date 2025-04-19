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
import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'

import { ComponentSizeType, CustomInput, CustomInputProps } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICKeyBulb } from '@Icons/ic-key-bulb.svg'

const TEXT_FIELD_LAYOUT_MAP: Record<CustomInputProps['layout'], null> = {
    row: null,
    column: null,
}

const TEXT_FIELD_SIZE_MAP: Record<CustomInputProps['size'], null> = {
    medium: null,
    large: null,
}

const meta = {
    component: CustomInput,
    argTypes: {
        layout: {
            options: Object.keys(TEXT_FIELD_LAYOUT_MAP),
            control: { type: 'radio' },
        },
        size: {
            options: Object.keys(TEXT_FIELD_SIZE_MAP),
            control: { type: 'radio' },
        },
    },
} satisfies Meta<CustomInputProps>

export default meta
type Story = StoryObj<typeof meta>

const TextFieldTemplate: Story = {
    render: (props) => {
        const [value, setValue] = useState<CustomInputProps['value']>(props.value)

        useEffect(() => {
            setValue(props.value)
        }, [props.value])

        const handleChange: CustomInputProps['onChange'] = (e) => {
            setValue(e.target.value)
            action('changed')(e)
        }

        return <CustomInput {...props} value={value} onChange={handleChange} />
    },
    args: {
        name: 'text-field',
        label: 'Text Field',
        value: '',
        placeholder: 'Enter value',
        onChange: null,
        layout: 'column',
        size: ComponentSizeType.large,
    },
}

export const Default: Story = {
    ...TextFieldTemplate,
}

export const WithMediumSize: Story = {
    ...Default,
    args: {
        ...Default.args,
        size: ComponentSizeType.medium,
    },
}

export const WithOnBlur: Story = {
    ...Default,
    args: {
        ...Default.args,
        onBlur: action('onBlur'),
    },
}

export const WithOnKeyDown: Story = {
    ...Default,
    args: {
        ...Default.args,
        onKeyDown: action('onKeyDown'),
    },
}

export const WithoutTrimOnBlur: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldTrim: false,
    },
}

export const WithHelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Helper text goes here',
    },
}

export const WithError: Story = {
    ...Default,
    args: {
        ...Default.args,
        error: 'Error goes here',
    },
}

export const WithWarningText: Story = {
    ...Default,
    args: {
        ...Default.args,
        warningText: 'Warning goes here',
    },
}

export const WithErrorHelperAndWarningText: Story = {
    ...Default,
    args: {
        ...WithError.args,
        ...WithHelperText.args,
        ...WithWarningText.args,
    },
}

export const WithRequiredAttribute: Story = {
    ...Default,
    args: {
        ...Default.args,
        required: true,
    },
}

export const WithRowLayout: Story = {
    ...Default,
    args: {
        ...Default.args,
        layout: 'row',
    },
}

export const WithFullWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        fullWidth: true,
    },
}

export const HelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Information goes here',
    },
}

export const WithDisabled: Story = {
    ...Default,
    args: {
        ...Default.args,
        disabled: true,
    },
}

export const WithOnFocus: Story = {
    ...Default,
    args: {
        ...Default.args,
        onFocus: action('onFocus'),
    },
}

export const WithAutoFocus: Story = {
    ...WithOnFocus,
    args: {
        ...WithOnFocus.args,
        autoFocus: true,
    },
}

export const WithNoTopBorderRadius: Story = {
    ...Default,
    args: {
        ...Default.args,
        borderRadiusConfig: {
            top: false,
        },
    },
}

export const WithNumberType: Story = {
    ...Default,
    args: {
        ...Default.args,
        label: 'Age',
        placeholder: 'Enter age',
        type: 'number',
    },
}

export const WithEndIcon: Story = {
    ...Default,
    args: {
        ...Default.args,
        endIconButtonConfig: {
            icon: <ICKeyBulb />,
            onClick: action('end icon clicked'),
            ariaLabel: 'End icon',
            showAriaLabelInTippy: false,
        },
    },
}

export const WithLabelHelperTippy: Story = {
    ...WithRequiredAttribute,
    args: {
        ...WithRequiredAttribute.args,
        label: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis maiores natus dolorum porro vero ad quod suscipit. Eveniet quidem nemo assumenda, tempora dolore aliquam accusamus nam dolorum ad molestias libero.',
        labelTippyCustomizedConfig: {
            heading: 'Heading',
            infoText: 'Info text',
            documentationLink: 'https://www.devtron.ai',
            documentationLinkText: 'Documentation',
        },
    },
}

export const WithLabelHelperTippyInRowLayout: Story = {
    ...WithRequiredAttribute,
    args: {
        ...WithRequiredAttribute.args,
        label: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis maiores natus dolorum porro vero ad quod suscipit. Eveniet quidem nemo assumenda, tempora dolore aliquam accusamus nam dolorum ad molestias libero.',
        layout: 'row',
        labelTooltipConfig: {
            content: 'Helper Text',
        },
    },
}
