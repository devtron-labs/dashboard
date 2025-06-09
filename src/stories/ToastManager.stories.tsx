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

import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'

import { Button, Icon, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { UPDATE_AVAILABLE_TOAST_PROGRESS_BG } from '@Config/constants'

type ShowToastParameters = Parameters<typeof ToastManager.showToast>

const meta = {
    title: 'Toast',
    render: ({ toastProps, toastOptions }) => {
        const handleClick = (toastVariant: ToastVariantType) => () => {
            ToastManager.showToast({ ...toastProps, variant: ToastVariantType[toastVariant] }, toastOptions)
        }

        return (
            <div className="flex flex-wrap dc__gap-8">
                {Object.keys(ToastVariantType).map((toastVariant) => (
                    <Button
                        text={`Show ${ToastVariantType[toastVariant]} toast`}
                        dataTestId={`show-toast-${ToastVariantType[toastVariant]}`}
                        onClick={handleClick(ToastVariantType[toastVariant])}
                        key={toastVariant}
                    />
                ))}
            </div>
        )
    },
} satisfies Meta<{
    toastProps: ShowToastParameters[0]
    toastOptions?: ShowToastParameters[1]
}>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        toastProps: {
            description:
                'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia aspernatur, odio vero vitae omnis quos cumque quaerat debitis minus blanditiis, autem distinctio, animi exercitationem nesciunt nostrum commodi id consequuntur unde!',
        },
    },
}

export const CustomTitle: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...Default.args.toastProps,
            title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure animi possimus, itaque commodi perspiciatis omnis adipisci, eum voluptatem facilis exercitationem voluptate aspernatur dolorem quasi! Odio, voluptates! Quas ipsum quaerat enim? Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure animi possimus, itaque commodi perspiciatis omnis adipisci, eum voluptatem facilis exercitationem voluptate aspernatur dolorem quasi! Odio, voluptates! Quas ipsum quaerat enim?',
        },
    },
}

export const WithButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...Default.args.toastProps,
            buttonProps: {
                dataTestId: 'button',
                text: 'Reload',
                startIcon: <ICArrowClockwise />,
                onClick: action('Reload clicked'),
            },
        },
    },
}

export const CustomTitleAndButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...CustomTitle.args.toastProps,
            ...WithButton.args.toastProps,
        },
    },
}

export const AutoCloseDisabled: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastOptions: {
            ...Default.args.toastOptions,
            autoClose: false,
        },
    },
}

export const CustomIconAndProgressBar: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...Default.args.toastProps,
            icon: <Icon name="ic-sparkle-color" color={null} />,
            progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            buttonProps: {
                ...WithButton.args.toastProps.buttonProps,
            },
        },
    },
}
