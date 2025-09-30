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

import { FunctionComponent } from 'react'

import { ErrorScreenNotAuthorized } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../components/common'
import BuildInfraUtilityProvider from './BuildInfraUtiltityProvider'
import ProfileForm from './ProfileForm'
import { BuildInfraProps } from './types'

const BuildInfraRouter = importComponentFromFELibrary('BuildInfraRouter', null, 'function')

export const BuildInfra: FunctionComponent<BuildInfraProps> = ({ isSuperAdmin }) => {
    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    const content = BuildInfraRouter ? (
        <BuildInfraUtilityProvider>
            <BuildInfraRouter />
        </BuildInfraUtilityProvider>
    ) : (
        <ProfileForm />
    )

    return content
}

export default BuildInfra
