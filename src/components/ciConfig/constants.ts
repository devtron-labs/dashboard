import { CIBuildType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as BuildpackIcon } from '../../assets/icons/ic-builpack.svg'
import { CIBuildTypeOptionType } from './types'

export const CI_BUILD_TYPE_OPTIONS: CIBuildTypeOptionType[] = [
    {
        id: CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
        heading: 'I have a Dockerfile',
        info: 'Requires a Dockerfile, gives full control of the build process.',
        icon: FileIcon,
        noIconFill: false,
        iconStroke: true,
        addDivider: true,
    },
    {
        id: CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE,
        heading: 'Create Dockerfile',
        info: 'Select from available templates and create a Dockerfile.',
        icon: AddIcon,
        noIconFill: false,
        iconStroke: false,
        addDivider: true,
    },
    {
        id: CIBuildType.BUILDPACK_BUILD_TYPE,
        heading: 'Build without Dockerfile',
        info: 'Uses buildpack to build container image.',
        icon: BuildpackIcon,
        noIconFill: true,
        iconStroke: false,
        addDivider: false,
    },
]
