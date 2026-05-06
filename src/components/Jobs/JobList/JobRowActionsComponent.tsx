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

import { MouseEvent } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    TableRowActionsOnHoverComponentProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { JobTableAdditionalProps, JobTableRowData } from './types'

// Row actions hover component
export const JobRowActionsComponent = ({
    row,
    handleEditJob,
}: TableRowActionsOnHoverComponentProps<JobTableRowData, JobTableAdditionalProps> & JobTableAdditionalProps) => {
    const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        handleEditJob(row.data.id)
    }

    return (
        <div className="flex right py-2">
            <Button
                style={ButtonStyleType.neutral}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
                icon={<Icon name="ic-gear" color={null} />}
                dataTestId="edit-job-button"
                onClick={handleEdit}
                ariaLabel="Open job configurations"
                showAriaLabelInTippy={false}
            />
        </div>
    )
}
