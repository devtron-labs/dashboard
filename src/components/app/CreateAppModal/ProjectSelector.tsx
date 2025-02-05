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
