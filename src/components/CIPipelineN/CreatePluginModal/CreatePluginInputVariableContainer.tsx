import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICAsterisk } from '@Icons/ic-asterisk.svg'
import { CreatePluginActionType, CreatePluginInputVariableContainerProps, InputVariableItemProps } from './types'

const InputVariableItem = ({ handleChange, index, name, allowEmptyValue }: InputVariableItemProps) => {
    const handleAllowEmptyValueToggle = () => {
        handleChange({ action: CreatePluginActionType.TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE, payload: { index } })
    }

    return (
        <div className="p-8 flexbox dc__content-space dc__gap-8">
            <h4 className={`m-0 dc__truncate cn-9 fw-4 fs-13 lh-20 ${!allowEmptyValue ? 'dc__required-field' : ''}`}>
                {name}
            </h4>

            <div className="w-28 h-18">
                <Toggle
                    selected={!allowEmptyValue}
                    onSelect={handleAllowEmptyValueToggle}
                    name={`toggle-${name}-allow-empty-value`}
                    rootClassName="mb-0 dc__toggle-square-toggle"
                    Icon={ICAsterisk}
                    iconClass={`bg__primary ${!allowEmptyValue ? 'fcr-5' : 'fcn-6'}`}
                    color={!allowEmptyValue ? 'var(--B300)' : 'var(--N200)'}
                />
            </div>
        </div>
    )
}

const CreatePluginInputVariableContainer = ({
    inputVariables,
    handleChange,
}: CreatePluginInputVariableContainerProps) => {
    if (!inputVariables.length) {
        return null
    }

    return (
        <>
            <div className="dc__border-bottom-n1" />

            <div className="flexbox-col dc__gap-8">
                <h3 className="m-0 cn-9 fs-13 fw-6 lh-20">
                    Mark input variables as mandatory/optional for this plugin
                </h3>
                <div className="create-plugin-form__input-variable-container flexbox-col p-4 br-8 dc__border bg__primary">
                    {inputVariables.map((inputVariable, index) => (
                        <InputVariableItem
                            key={inputVariable.name}
                            handleChange={handleChange}
                            index={index}
                            name={inputVariable.name}
                            allowEmptyValue={inputVariable.allowEmptyValue}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default CreatePluginInputVariableContainer
