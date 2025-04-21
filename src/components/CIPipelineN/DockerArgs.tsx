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

import { InfoIconTippy, KeyValueTable, KeyValueTableProps } from '@devtron-labs/devtron-fe-common-lib'

import { DockerArgsProps } from './types'

const DockerArgs = ({
    args,
    handleDockerArgsUpdate,
    handleDockerArgsError,
    fromBuildPack = false,
    readOnly,
}: DockerArgsProps) => {
    const heading = fromBuildPack ? 'Build Env Arguments' : 'Docker Build Arguments'

    const validationSchema: KeyValueTableProps['validationSchema'] = (value, key, row) => {
        if (key === 'value' && row.data.key.value && !value) {
            return { isValid: false, errorMessages: ['This field is required'] }
        }

        return { isValid: true }
    }

    return (
        <div className="flexbox-col dc__gap-8">
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
            </div>

            <KeyValueTable
                headerLabel={{ key: 'Key', value: 'Value' }}
                placeholder={{ key: 'Enter key', value: 'Enter value' }}
                initialRows={args.map(({ key, value }, id) => ({
                    data: { key: { value: key }, value: { value } },
                    id,
                }))}
                readOnly={readOnly}
                onChange={handleDockerArgsUpdate}
                onError={handleDockerArgsError}
                showError
                validateEmptyKeys
                validateDuplicateKeys
                validationSchema={validationSchema}
            />
        </div>
    )
}

export default DockerArgs
