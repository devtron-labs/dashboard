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

import type { JSX } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

export const getEnvironmentName = (
    clusterName: string,
    namespace: string,
    environmentName: string,
): string | JSX.Element => {
    if (environmentName) {
        return environmentName
    }
    if (clusterName && namespace) {
        return `${clusterName}__${namespace}`
    }
    return <span>&nbsp;</span>
}

export const getUsedChartContent = (isDeprecated: boolean, onClickUpgrade: () => void) => (
    <div className="flexbox-col dc__gap-8 py-6">
        <div>
            {isDeprecated ? (
                <div>
                    <span className="fw-6">Chart deprecated</span>
                    <div>This chart has been deprecated. Change chart or chart version.</div>
                </div>
            ) : (
                <div>
                    <span className="fw-6">Chart used</span>
                    <div>Chart used to deploy to this application</div>
                </div>
            )}
        </div>
        <Button
            dataTestId="chart-used-upgrade-button"
            variant={ButtonVariantType.text}
            style={ButtonStyleType.neutralWhite}
            size={ComponentSizeType.small}
            onClick={onClickUpgrade}
            endIcon={<Icon name="ic-arrow-right" color={null} />}
            text="Go to Configure"
        />
    </div>
)
