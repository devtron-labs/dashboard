/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React from 'react'
import { components } from 'react-select'
import { EntityTypes } from '../userGroups/userGroups.types'
import { GroupHeading } from '../../../../../../components/v2/common/ReactSelect.utils'

export const WorkflowGroupHeading = (props) => {
    return <GroupHeading {...props} hideClusterName />
}

export const AppOption = ({ props, permission }) => {
    const { selectOption, data } = props
    return (
        <div
            onClick={() => selectOption(data)}
            className="flex left pl-12"
            style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
        >
            <input
                checked={props.isSelected}
                type="checkbox"
                style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
            />
            <div className="flex left column w-100">
                <components.Option className="w-100 option-label-padding" {...props} />
                {data.value === '*' && (
                    <span className="fs-12 cn-6 ml-8 mb-4 mr-4">
                        {`Allow access to existing and new ${
                            permission.entity === EntityTypes.JOB ? 'jobs' : 'apps'
                        } for this project`}
                    </span>
                )}
            </div>
        </div>
    )
}

export const ValueContainer = (props) => {
    const { length } = props.getValue()
    let optionLength = props.options.length
    if (props.selectProps.name === 'environment' || props.selectProps.name === 'workflow') {
        let _optionLength = 0
        props.options.forEach((option) => {
            // eslint-disable-next-line no-unsafe-optional-chaining
            _optionLength += option.options?.length
        })
        optionLength = _optionLength
    }

    let count = ''
    if (
        length === optionLength &&
        (props.selectProps.name.includes('entityName') ||
            props.selectProps.name === 'environment' ||
            props.selectProps.name.includes('workflow'))
    ) {
        count = 'All'
    } else {
        count = length
    }
    let Item
    if (props.selectProps.name.includes('entityName')) {
        Item = props.selectProps.name.split('/')[1] === 'jobs' ? 'job' : 'application'
    } else {
        Item = props.selectProps.name === 'environment' ? 'environment' : 'workflow'
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && `${count} ${Item}${length !== 1 ? 's' : ''}`}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const clusterValueContainer = (props) => {
    const { length } = props
        .getValue()
        .filter((opt) => opt.value && !opt.value.startsWith('#') && !opt.value.startsWith('*'))
    let count = ''
    const totalEnv = props.options.reduce((len, cluster) => {
        // eslint-disable-next-line no-param-reassign
        len += cluster.options.length - 2
        return len
    }, 0)
    if (length === totalEnv) {
        count = 'All environments'
    } else {
        count = `${length} environment${length !== 1 ? 's' : ''}`
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && count}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const ProjectValueContainer = (props) => {
    const value = props.getValue()
    return (
        <components.ValueContainer {...props}>
            {value[0] ? (
                <>
                    {!props.selectProps.menuIsOpen && value[0].value}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                props.children
            )}
        </components.ValueContainer>
    )
}
