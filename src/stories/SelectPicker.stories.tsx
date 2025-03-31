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
import { action } from '@storybook/addon-actions'
import {
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICEnv } from '@Icons/ic-env.svg'

const SELECT_PICKER_LAYOUT_MAP: Record<SelectPickerProps['layout'], null> = {
    row: null,
    column: null,
}

const meta = {
    component: SelectPicker,
    argTypes: {
        variant: {
            options: Object.values(SelectPickerVariantType),
            control: { type: 'radio' },
        },
        size: {
            options: Object.values(ComponentSizeType),
            control: { type: 'select' },
        },
        menuSize: {
            options: Object.values(ComponentSizeType),
            control: { type: 'select' },
        },
        shouldMenuAlignRight: {
            control: { type: 'boolean' },
        },
        layout: {
            options: Object.keys(SELECT_PICKER_LAYOUT_MAP),
            control: { type: 'select' },
        },
    },
} satisfies Meta<SelectPickerProps>

export default meta
type Story = StoryObj<typeof meta>

const options: SelectPickerOptionType[] = [
    {
        label: 'Label 1',
        value: 'Label 1',
    },
    {
        label: 'Label 2',
        value: 'Label 2',
    },
]

export const Default: Story = {
    args: {
        inputId: 'select-picker',
        label: 'Select Picker Label',
        options,
        onChange: action('clicked'),
        variant: SelectPickerVariantType.DEFAULT,
        size: ComponentSizeType.medium,
        menuSize: ComponentSizeType.small,
        shouldMenuAlignRight: false,
        layout: 'column',
    },
}

export const DescriptionInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            description: `Description ${index}`,
        })),
    },
}

export const StartIconInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            startIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
    },
}

export const EndIconIconInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            endIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
    },
}

export const HideSelectedOptionIcon: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            startIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
        showSelectedOptionIcon: false,
    },
}

export const LargeSize: Story = {
    ...Default,
    args: {
        ...Default.args,
        size: ComponentSizeType.large,
    },
}

export const IconInControl: Story = {
    ...Default,
    args: {
        ...Default.args,
        icon: <Icon color="B500" name="ic-cube" />,
    },
}

export const MediumMenuListWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuSize: ComponentSizeType.medium,
    },
}

export const LargeMenuListWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuSize: ComponentSizeType.large,
    },
}

export const Required: Story = {
    ...Default,
    args: {
        ...Default.args,
        required: true,
    },
}
export const CustomLabel: Story = {
    ...Default,
    args: {
        ...Default.args,
        label: 'Custom Label',
    },
}
export const ErrorState: Story = {
    ...Default,
    args: {
        ...Default.args,
        error: 'Something went wrong',
    },
}

export const HelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Information goes here',
    },
}

export const MenuListFooterWithText: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuListFooterConfig: {
            type: 'text',
            value: 'Footer text',
        },
    },
}

export const MenuListFooterPrimaryButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuListFooterConfig: {
            type: 'button',
            buttonProps: {
                text: 'Primary Button',
                variant: ButtonVariantType.primary,
                onClick: action('footer button clicked'),
                dataTestId: 'footer-button',
                startIcon: <ICEnv />,
            },
        },
    },
}

export const MenuListFooterBorderLessButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuListFooterConfig: {
            type: 'button',
            buttonProps: {
                text: 'Border Less Button',
                variant: ButtonVariantType.borderLess,
                onClick: action('footer button clicked'),
                dataTestId: 'footer-button',
                startIcon: <ICEnv />,
            },
        },
    },
}

export const Loading: Story = {
    ...Default,
    args: {
        ...Default.args,
        isLoading: true,
    },
}

export const Disabled: Story = {
    ...Default,
    args: {
        ...Default.args,
        isDisabled: true,
    },
}

export const ClearableSelectedOption: Story = {
    ...Default,
    args: {
        ...Default.args,
        isClearable: true,
    },
}

export const ShowSelectedOptionsCount: Story = {
    ...Default,
    args: {
        ...Default.args,
        showSelectedOptionIcon: true,
    },
}

export const MultiSelect: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
    },
}

export const CreatableMultiSelect: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
        isCreatable: true,
    },
}

export const MultiSelectWithGroupHeadingSelectable: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
        multiSelectProps: {
            isGroupHeadingSelectable: true,
        },
        options: [
            {
                label: 'Group 1',
                options,
            },
        ],
    },
}

export const RenderCustomOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldRenderCustomOptions: true,
        renderCustomOptions: () => <div className="p-8">Custom Option</div>,
    },
}

export const AlignMenuFromRight: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldMenuAlignRight: true,
    },
}

export const FullWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        fullWidth: true,
    },
}

export const CustomPlaceholder: Story = {
    ...Default,
    args: {
        ...Default.args,
        placeholder: 'Custom Placeholder',
    },
}

export const WithLabelHelperTippy: Story = {
    ...Required,
    args: {
        ...Required.args,
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
    ...Required,
    args: {
        ...Required.args,
        label: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis maiores natus dolorum porro vero ad quod suscipit. Eveniet quidem nemo assumenda, tempora dolore aliquam accusamus nam dolorum ad molestias libero.',
        layout: 'row',
        labelTooltipConfig: {
            content: 'Helper Text',
        },
    },
}
