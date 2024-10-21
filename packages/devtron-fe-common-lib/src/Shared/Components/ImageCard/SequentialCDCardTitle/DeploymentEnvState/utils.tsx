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

import { DEPLOYMENT_ENV_TEXT } from './constants'
import { GetDeploymentEnvConfigType } from './types'
import { ReactComponent as ICWorld } from '../../../../../Assets/Icon/ic-world.svg'
import { ReactComponent as ICRocketFail } from '../../../../../Assets/Icon/ic-rocket-fail.svg'

export const getDeploymentEnvConfig = (envStateText: string): GetDeploymentEnvConfigType => {
    switch (envStateText) {
        case DEPLOYMENT_ENV_TEXT.VIRTUAL_ENV:
        case DEPLOYMENT_ENV_TEXT.ACTIVE:
            return { Icon: <ICWorld className="icon-dim-16 mr-4 scg-5" />, stateClassName: 'bcg-1 eg-2' }

        case DEPLOYMENT_ENV_TEXT.FAILED:
            return { Icon: <ICRocketFail className="icon-dim-16 mr-4" />, stateClassName: 'bcr-1 er-2' }

        case DEPLOYMENT_ENV_TEXT.DEPLOYING:
            return {
                Icon: <div className="dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node" />,
                stateClassName: 'bcy-1 ey-2',
            }

        default:
            return {
                Icon: null,
                stateClassName: '',
            }
    }
}
