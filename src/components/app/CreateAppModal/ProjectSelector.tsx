import {
    ComponentSizeType,
    ResourceKindType,
    SelectPicker,
    SelectPickerProps,
    useGetResourceKindsOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICFolderColor } from '@Icons/ic-folder-color.svg'
import { CreateAppFormStateType } from './types'

const ProjectSelector = ({
    selectedProjectId,
    handleProjectIdChange,
}: {
    selectedProjectId: CreateAppFormStateType['projectId']
    handleProjectIdChange: (projectId: CreateAppFormStateType['projectId']) => void
}) => {
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
        <div className="w-200">
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
            />
        </div>
    )
}

export default ProjectSelector
