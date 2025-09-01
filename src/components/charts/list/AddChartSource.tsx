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

import { ActionMenu, ButtonVariantType, ComponentSizeType, Icon, noop } from '@devtron-labs/devtron-fe-common-lib'

import { getAddSourceActionMenuOptions } from '../constants'

const AddChartSource = ({ text }: { text?: string }) => (
    <ActionMenu
        id="chart-store-add-source-action-menu"
        onClick={noop}
        options={getAddSourceActionMenuOptions()}
        buttonProps={{
            text,
            dataTestId: 'add-chart-source-button',
            startIcon: <Icon name="ic-add" color="B500" />,
            size: ComponentSizeType.small,
            variant: ButtonVariantType.borderLess,
        }}
    />
)

export default AddChartSource
