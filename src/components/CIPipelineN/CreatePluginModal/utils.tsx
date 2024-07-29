import { components } from 'react-select'
import {
    commonSelectStyles,
    requiredField,
    validateSematicVersioning,
    validateURL,
    ValidationResponseType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { CreatePluginFormType } from './types'
import { CREATE_PLUGIN_DEFAULT_FORM, MAX_TAG_LENGTH } from './constants'

export const getDefaultPluginFormData = (currentInputVariables: VariableType[]): CreatePluginFormType => {
    return {
        ...structuredClone(CREATE_PLUGIN_DEFAULT_FORM),
        inputVariables: currentInputVariables,
    }
}

export const getIsTagValid = (tag: string): boolean => tag.length <= MAX_TAG_LENGTH

/**
 * Tag length can be maximum of 128 characters
 */
export const validateTags = (tags: string[]): ValidationResponseType => {
    const areTagsInvalid = tags.some((tag) => !getIsTagValid(tag))
    if (areTagsInvalid) {
        return {
            isValid: false,
            message: `Tag name should not exceed ${MAX_TAG_LENGTH} characters`,
        }
    }

    return {
        isValid: true,
    }
}

/**
 * Doc link can be empty or must be a valid URL
 */
export const validateDocumentationLink = (docLink: string): ValidationResponseType => {
    if (!docLink) {
        return {
            isValid: true,
        }
    }

    return validateURL(docLink)
}

export const validatePluginVersion = (version: string): ValidationResponseType => {
    const requiredFieldValidation = requiredField(version)
    if (!requiredFieldValidation.isValid) {
        return requiredFieldValidation
    }

    return validateSematicVersioning(version)
}

export const pluginCreatableTagSelectStyles = {
    ...commonSelectStyles,
    valueContainer: (base) => ({
        ...commonSelectStyles.valueContainer(base),
        gap: '4px',
        paddingBlock: '4px',
    }),
    control: (base, state) => ({
        ...commonSelectStyles.control(base, state),
        minHeight: '36px',
    }),
    menuList: (base) => ({
        ...base,
        padding: '4px 0px 0px 0px',
        cursor: 'pointer',
    }),
    option: (base, state) => ({
        ...base,
        height: '36px',
        padding: '8px 0px',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',

        ':active': {
            backgroundColor: 'var(--N100)',
        },
    }),
    multiValue: (base, state) => ({
        ...base,
        border: getIsTagValid(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
        borderRadius: `4px`,
        background: getIsTagValid(state.data.value) ? 'white' : 'var(--R100)',
        height: '28px',
        maxWidth: '250px',
        margin: 0,
        paddingLeft: '2px 4px',
        fontSize: '12px',
    }),
}

export const PluginCreatableTagClearIndicator = (props) => (
    <components.ClearIndicator {...props}>
        <ICClose className="icon-dim-16 fcn-6 dc__no-shrink" />
    </components.ClearIndicator>
)
