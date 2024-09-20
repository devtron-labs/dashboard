import type { Meta, StoryObj } from '@storybook/react'

import {
    Button,
    CustomInput,
    useForm,
    UseFormSubmitHandler,
    UseFormValidations,
} from '@devtron-labs/devtron-fe-common-lib'

// Storybook Template
type FormData = {
    email: string
    password: string
}

const validations: UseFormValidations<FormData> = {
    email: {
        required: true,
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email address',
        },
    },
    password: {
        required: true,
        custom: [
            {
                isValid: (value) => value.length >= 6,
                message: 'Password must be at least 6 characters long',
            },
        ],
    },
}

const FormComponent = ({ validationMode }: { validationMode: 'onChange' | 'onBlur' }) => {
    const { data, errors, register, handleSubmit, formState } = useForm<FormData>({
        initialValues: { email: '', password: '' },
        validations,
        validationMode,
    })

    const onSubmit: UseFormSubmitHandler<FormData> = (data) => {
        alert(JSON.stringify(data, null, 2))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flexbox-col dc__gap-12">
            <div>
                <CustomInput
                    label="Email"
                    value={data.email}
                    {...register('email')}
                    inputProps={{ type: 'email' }}
                    noTrim
                />
                {errors.email && <p className="m-0 cr-5">{errors.email}</p>}
            </div>
            <div>
                <CustomInput label="Password" value={data.password} {...register('password')} type="password" noTrim />
                {errors.password && <p className="m-0 cr-5">{errors.password}</p>}
            </div>
            <Button dataTestId="useForm-story-submit-btn" buttonProps={{ type: 'submit' }} text="Submit" />
            <div style={{ marginTop: '20px' }}>
                <strong>Form State:</strong>
                <pre>{JSON.stringify(formState, null, 2)}</pre>
            </div>
        </form>
    )
}

// Storybook Meta Configuration
const meta = {
    component: FormComponent,
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Stories
export const FormWithOnChangeValidationMode: Story = {
    args: {
        validationMode: 'onChange',
    },
}

export const FormWithOnBlurValidationMode: Story = {
    args: {
        validationMode: 'onBlur',
    },
}
