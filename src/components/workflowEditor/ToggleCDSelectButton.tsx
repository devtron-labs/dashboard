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

import { Button, ButtonStyleType, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { DeleteCINodeButton } from '@Components/ciPipeline/DeleteCINodeButton'
import { ToggleCDSelectButtonProps } from './types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

const ToggleCDSelectButton = ({
    addNewPipelineBlocked,
    onClickAddNode,
    testId,
    deleteConfig,
    getWorkflows,
}: ToggleCDSelectButtonProps) => (
    <div className="h-100 dc__border-left-n1 w-24 dc__align-items-center dc__grid-rows-2 ci-node__action-button dc__right-radius-8">
        <Button
            ariaLabel={
                addNewPipelineBlocked
                    ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                    : 'Add deployment pipeline'
            }
            variant={ButtonVariantType.borderLess}
            dataTestId={`${testId}-add`}
            onClick={onClickAddNode}
            icon={<Add />}
            disabled={addNewPipelineBlocked}
            size={ComponentSizeType.xs}
            showAriaLabelInTippy
            style={ButtonStyleType.neutral}
            fullWidth
        />

        <DeleteCINodeButton
            testId={`${testId}-delete`}
            disabled={false}
            deletePayloadConfig={deleteConfig}
            title={deleteConfig.pipelineName}
            getWorkflows={getWorkflows}
        />
    </div>
)

export default ToggleCDSelectButton
