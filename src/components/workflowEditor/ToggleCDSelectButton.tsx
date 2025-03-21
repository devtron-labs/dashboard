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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DeleteCINodeButton,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import { ToggleCDSelectButtonProps } from './types'

const ToggleCDSelectButton = ({
    addNewPipelineBlocked,
    onClickAddNode,
    testId,
    deleteConfig,
    getWorkflows,
    hideDeleteButton = false,
    isTemplateView,
}: ToggleCDSelectButtonProps) => (
    <div
        className={`${!hideDeleteButton ? 'dc__grid-rows-2' : 'flex'} ci-node__action-button dc__right-radius-8 h-100 dc__border-left-n1 w-24 dc__align-items-center`}
    >
        <div className={`${!hideDeleteButton ? 'dc__border-bottom-n1' : ''}`}>
            <Button
                ariaLabel={
                    addNewPipelineBlocked
                        ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                        : 'Add deployment pipeline'
                }
                variant={ButtonVariantType.borderLess}
                dataTestId={`${testId}-add-button`}
                onClick={onClickAddNode}
                icon={<Icon size={12} name="ic-add" color={null} />}
                disabled={addNewPipelineBlocked}
                size={ComponentSizeType.xxs_small_icon}
                style={ButtonStyleType.neutral}
                fullWidth
                showTooltip
                tooltipProps={{
                    placement: 'right',
                    content: addNewPipelineBlocked
                        ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                        : 'Add deployment pipeline',
                }}
            />
        </div>

        {!hideDeleteButton && (
            <DeleteCINodeButton
                testId={`${testId}-delete-button`}
                deletePayloadConfig={deleteConfig}
                title={deleteConfig.pipelineName}
                getWorkflows={getWorkflows}
                isTemplateView={isTemplateView}
            />
        )}
    </div>
)

export default ToggleCDSelectButton
