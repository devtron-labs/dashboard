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

import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'

import { AddConfigurationButton } from './AddConfigurationButton'
import { EmptyConfigurationSubTitle } from './constants'
import { EmptyConfigurationViewProps } from './types'

export const EmptyConfigurationView = ({ activeTab, image }: EmptyConfigurationViewProps) => {
    const renderButton = () => <AddConfigurationButton activeTab={activeTab} />
    return (
        <GenericEmptyState
            SvgImage={image}
            title={`Send Email notifications via ${activeTab}`}
            subTitle={EmptyConfigurationSubTitle[activeTab]}
            imageClassName="w-160--imp dc__height-auto--imp"
            renderButton={renderButton}
            isButtonAvailable
            imageStyles={{
                height: 'auto',
            }}
        />
    )
}
