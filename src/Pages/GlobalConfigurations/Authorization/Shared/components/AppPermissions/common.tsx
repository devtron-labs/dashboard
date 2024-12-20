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

/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React from 'react'
import { components } from 'react-select'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE, DirectPermissionFieldName } from './constants'

export const ValueContainer = (props) => {
    const { length } = props.getValue()
    let optionLength = props.options.length
    if (
        props.selectProps.name === DirectPermissionFieldName.environment ||
        props.selectProps.name === DirectPermissionFieldName.workflow
    ) {
        optionLength = props.options.reduce((acc, option) => acc + (option.options?.length ?? 0), 0)
    }

    const count = length === optionLength ? 'All' : length

    let Item
    if (props.selectProps.name === DirectPermissionFieldName.apps) {
        Item = 'application'
    } else if (props.selectProps.name === DirectPermissionFieldName.jobs) {
        Item = 'job'
    } else {
        Item = props.selectProps.name
    }

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {/* Count of selected options */}
                    {!props.selectProps.menuIsOpen && `${count} ${Item}${length !== 1 ? 's' : ''}`}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                props.children
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
    // 2 represents all existing cluster option and all existing + future cluster option
    const totalEnv = props.options.reduce((len, cluster) => len + (cluster.options.length - 2), 0)
    if (length === totalEnv) {
        count = 'All environments'
    } else {
        count = `${length} environment${length !== 1 ? 's' : ''}`
    }

    return (
        <components.ValueContainer {...props}>
            {!props.selectProps.menuIsOpen && (length > 0 ? count : props.selectProps.placeholder)}
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}
