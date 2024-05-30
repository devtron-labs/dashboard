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

import React, { FunctionComponent } from 'react'
import { CustomInput, InfoIconTippy } from '@devtron-labs/devtron-fe-common-lib'
import { DockerArgsAction, DockerArgsItemProps, DockerArgsProps } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'

const DockerArgsItem: FunctionComponent<DockerArgsItemProps> = ({
    arg,
    index,
    handleDockerArgsUpdate,
    fromBuildPack,
    readOnly,
}) => {
    const handleDockerArgKeyUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const argData = {
            index,
            value: event.target.value,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.UPDATE_KEY, argData })
    }

    const handleDockerArgValueUpdate = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const argData = {
            index,
            value: event.target.value,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.UPDATE_VALUE, argData })
    }

    const handleRemoveDockerArg = () => {
        const argData = {
            index,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.DELETE, argData })
    }

    return (
        <div className="flexbox justify-space">
            <div className="mt-8 w-100">
                <CustomInput
                    name="arg-key"
                    data-testid={fromBuildPack ? `build-pack-build-env-key${index}` : `docker-arg-key-${index}`}
                    rootClassName={`w-100 dc__top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1 ${
                        readOnly ? 'cursor-not-allowed' : ''
                    }`}
                    autoComplete="off"
                    placeholder="Key"
                    type="text"
                    value={arg.key}
                    disabled={readOnly}
                    onChange={handleDockerArgKeyUpdate}
                />
                <textarea
                    data-testid={fromBuildPack ? `build-pack-build-env-value${index}` : `docker-arg-value-${index}`}
                    className={`w-100 dc__bottom-radius-4 dc__no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1 mxh-140 form__textarea ${
                        readOnly ? 'cursor-not-allowed bcn-1' : 'build__value'
                    }`}
                    value={arg.value}
                    placeholder="Value"
                    onChange={handleDockerArgValueUpdate}
                    disabled={readOnly}
                />
            </div>

            {!readOnly && (
                <button
                    className="dc__no-background flexbox dc__align-start dc__no-border dc__outline-none-imp"
                    onClick={handleRemoveDockerArg}
                    type="button"
                    aria-label="remove-docker-args"
                >
                    <Close className="icon-dim-24 mt-6 ml-6" />
                </button>
            )}
        </div>
    )
}

const DockerArgs: FunctionComponent<DockerArgsProps> = ({ args, handleDockerArgsUpdate, fromBuildPack, readOnly }) => {
    const handleAddDockerArgs = () => {
        handleDockerArgsUpdate({ action: DockerArgsAction.ADD })
    }

    const heading = fromBuildPack ? 'Build Env Arguments' : 'Docker Build Arguments'

    return (
        <div>
            <h3 className="flex left fs-13 fw-6 cn-9 lh-20 m-0">
                {heading}
                <InfoIconTippy
                    heading={heading}
                    infoText={`Key/value pair will be appended as
                            ${
                                fromBuildPack
                                    ? ' buildpack env arguments (--env).'
                                    : ' docker build arguments (--build-args).'
                            }`}
                    iconClassName="icon-dim-16 fcn-6 ml-4"
                />
            </h3>

            {!fromBuildPack && (
                <p className="fs-13 fw-4 cn-7 lh-20 m-0">Override docker build configurations for this pipeline.</p>
            )}

            {!readOnly && (
                <button
                    className="p-0 cb-5 fw-6 fs-13 flex content-fit lh-32 mt-8 dc__no-background dc__no-border dc__outline-none-imp"
                    onClick={handleAddDockerArgs}
                    data-testid={
                        fromBuildPack
                            ? 'create-build-pipeline-docker-args-add-argument-button'
                            : 'create-build-pipeline-docker-args-add-parameter-button'
                    }
                    type="button"
                >
                    <span className="fa fa-plus mr-8" />
                    Add {fromBuildPack ? 'argument' : 'parameter'}
                </button>
            )}

            {args.length > 0 &&
                args.map((arg, index) => (
                    <DockerArgsItem
                        // eslint-disable-next-line react/no-array-index-key
                        key={`build-${index}`}
                        index={index}
                        arg={arg}
                        handleDockerArgsUpdate={handleDockerArgsUpdate}
                        fromBuildPack={fromBuildPack}
                        readOnly={readOnly}
                    />
                ))}
        </div>
    )
}

export default DockerArgs
