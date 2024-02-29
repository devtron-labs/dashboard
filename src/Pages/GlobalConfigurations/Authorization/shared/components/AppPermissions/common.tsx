/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import { Checkbox, CHECKBOX_VALUE, noop } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { components } from 'react-select'
import { GroupHeading } from '../../../../../../components/v2/common/ReactSelect.utils'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { EntityTypes } from '../../../constants'
import { ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE } from './constants'

export const WorkflowGroupHeading = (props) => <GroupHeading {...props} hideClusterName />

export const AppOption = ({ props, permission }) => {
    const { selectOption, data } = props

    const _selectOption = () => {
        selectOption(data)
    }

    return (
        <div
            onClick={_selectOption}
            className="flex left pt-6 pb-6 pl-8 pr-8 dc__gap-8"
            style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
        >
            <Checkbox
                isChecked={props.isSelected}
                rootClassName="mb-0"
                value={CHECKBOX_VALUE.CHECKED}
                // No on change as the state is being controlled on the button itself
                onChange={noop}
            />
            <div className="flex left column w-100">
                <components.Option className="w-100 p-0-imp" {...props} />
                {data.value === SELECT_ALL_VALUE && (
                    <span className="fs-12 cn-6">
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
        optionLength = props.options.reduce((acc, option) => acc + (option.options?.length ?? 0), 0)
    }

    let count = ''
    // TODO (v3): Refactor
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

export const ClusterValueContainer = (props) => {
    const { length } = props
        .getValue()
        .filter(
            (opt) =>
                opt.value &&
                !opt.value.startsWith(ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE) &&
                !opt.value.startsWith(SELECT_ALL_VALUE),
        )
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
