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

import React from 'react'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import TLSInputField from './TLSInputField'
import { TLSConnectionFormActionType, TLSConnectionFormProps } from './types'

const TLSConnectionForm = ({
    insecureSkipTLSVerify,
    caData,
    certData,
    keyData,
    handleChange,
    isCreateView,
}: TLSConnectionFormProps) => {
    const handleToggle = () => {
        handleChange({ action: TLSConnectionFormActionType.TOGGLE_INSECURE_SKIP_TLS_VERIFY })
    }

    return (
        <div className="pt-16 pb-16 flexbox-col dc__gap-16 dc__border-top-n1 dc__border-bottom-n1">
            {/* TOGGLE HEADER */}
            <div className="flexbox dc__gap-20 dc__content-space">
                <div className="flexbox-col dc__gap-4">
                    <h2 className="m-0 cn-9 fs-14 fw-6 lh-20">Secure TLS connection</h2>
                    <p className="m-0 cn-7 fs-12 fw-4">
                        Enable a secure TLS connection for encrypted communication and authentication
                    </p>
                </div>

                <Toggle selected={!insecureSkipTLSVerify} onSelect={handleToggle} />
            </div>

            <TLSInputField
                label="Certificate Authority Data"
                id="certificate-authority-data"
                placeholder="Enter CA data"
                error={caData.error}
                value={caData.value}
                isSensitive={!isCreateView}
                handleChange={handleChange}
                updateAction={TLSConnectionFormActionType.UPDATE_CA_DATA}
            />
            <TLSInputField
                label="TLS Key"
                id="tls-key"
                placeholder="Enter TLS key"
                error={keyData.error}
                value={keyData.value}
                isSensitive={!isCreateView}
                handleChange={handleChange}
                updateAction={TLSConnectionFormActionType.UPDATE_KEY_DATA}
            />
            <TLSInputField
                label="TLS Certificate"
                id="tsl-certificate"
                placeholder="Enter TLS certificate"
                error={certData.error}
                value={certData.value}
                isSensitive={!isCreateView}
                handleChange={handleChange}
                updateAction={TLSConnectionFormActionType.UPDATE_CERT_DATA}
            />
        </div>
    )
}

export default TLSConnectionForm
