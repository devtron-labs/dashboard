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
    ComponentSizeType,
    ResourceKindType,
    SelectPicker,
    SelectPickerProps,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICFolderColor } from '@Icons/ic-folder-color.svg'

import { CreateAppFormStateType, ProjectSelectorProps } from './types'

const ProjectSelector = ({ selectedProjectId, handleProjectIdChange, error }: ProjectSelectorProps) => {
    const { isResourcesOptionsLoading, resourcesOptionsMap, resourcesOptionsError, refetchResourcesOptions } =
        useGetResourceKindsOptions({
            resourcesToFetch: [ResourceKindType.project],
        })
    const projectOptions = resourcesOptionsMap[ResourceKindType.project].map(({ id, name }) => ({
        label: name,
        value: id.toString(),
    }))
    const selectedProject = projectOptions.find(({ value }) => value === selectedProjectId) ?? null

    const handleChange: SelectPickerProps<CreateAppFormStateType['projectId']>['onChange'] = (
        selectedProjectOption,
    ) => {
        handleProjectIdChange(selectedProjectOption.value)
    }

    return (
        <div className="w-300">
            <SelectPicker
                icon={<ICFolderColor />}
                inputId="project"
                options={projectOptions}
                label="Project"
                required
                size={ComponentSizeType.large}
                fullWidth
                isLoading={isResourcesOptionsLoading}
                optionListError={resourcesOptionsError}
                reloadOptionList={refetchResourcesOptions}
                placeholder="Select project"
                value={selectedProject}
                onChange={handleChange}
                error={error}
            />
        </div>
    )
}

export default ProjectSelector
