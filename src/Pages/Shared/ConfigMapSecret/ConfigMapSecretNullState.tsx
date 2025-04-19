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

import { generatePath, useRouteMatch } from 'react-router-dom'

import { Button, ButtonComponentType, GenericEmptyState, ImageType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import EmptyStateImg from '@Images/cm-cs-empty-state.png'
import EmptyFolder from '@Images/empty-folder.webp'

import { CM_SECRET_EMPTY_STATE_TEXT, getCMSecretNullStateText } from './constants'
import { ConfigMapSecretNullStateProps } from './types'

export const ConfigMapSecretNullState = ({
    componentType,
    componentName,
    nullStateType,
}: ConfigMapSecretNullStateProps) => {
    // HOOKS
    const { path, params } = useRouteMatch()

    const noCMSecretPresent = nullStateType === 'NO_CM_CS'

    return (
        <GenericEmptyState
            {...getCMSecretNullStateText(componentType, componentName)[nullStateType]}
            image={noCMSecretPresent ? EmptyStateImg : EmptyFolder}
            classname="cm-cs-empty-state"
            imageType={ImageType.Large}
            isButtonAvailable={noCMSecretPresent}
            renderButton={() => (
                <Button
                    dataTestId="cm-cs-empty-state-btn"
                    component={ButtonComponentType.link}
                    startIcon={<ICAdd />}
                    text={CM_SECRET_EMPTY_STATE_TEXT[componentType].buttonText}
                    linkProps={{
                        to: generatePath(path, { ...params, name: 'create' }),
                    }}
                />
            )}
        />
    )
}
