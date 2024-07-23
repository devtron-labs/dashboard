import { SyntheticEvent } from 'react'
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { CreatePluginFormFieldProps } from './types'

const CreatePluginFormField = ({
    label,
    value,
    error,
    action,
    handleChange,
    placeholder,
    isRequired,
    isDisabled,
    useTextArea,
    autoFocus,
}: CreatePluginFormFieldProps) => {
    const handleInputChange = (e: SyntheticEvent) => {
        handleChange({ action, payload: (e.target as HTMLInputElement).value })
    }

    if (useTextArea) {
        return (
            <div className="flexbox-col dc__gap-6 w-100 dc__align-start">
                <label
                    htmlFor={action}
                    className={`m-0 fs-13 fw-4 lh-20 cn-7 ${isRequired ? 'dc__required-field' : ''}`}
                >
                    {label}
                </label>

                <textarea
                    name="profile-description"
                    className="form__textarea mxh-140 dc__hover-border-n300"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    id={action}
                    data-testid={action}
                    disabled={isDisabled}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={autoFocus}
                />

                {error && (
                    <div className="form__error">
                        <ICWarning className="form__icon form__icon--error" />
                        {error}
                    </div>
                )}
            </div>
        )
    }

    return (
        <CustomInput
            name={action}
            label={label}
            value={value}
            error={error}
            onChange={handleInputChange}
            placeholder={placeholder}
            isRequiredField={isRequired}
            disabled={isDisabled}
            dataTestid={action}
            autoFocus={autoFocus}
        />
    )
}

export default CreatePluginFormField
