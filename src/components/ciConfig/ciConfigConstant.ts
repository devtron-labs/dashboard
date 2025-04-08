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

import { CIBuildType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as BuildpackIcon } from '../../assets/icons/ic-builpack.svg'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { CIBuildTypeOptionType } from './types'

export const SelectorMessaging = {
    WARNING_WITH_NO_TARGET: 'You have entered a custom target platform, please ensure it is valid.',
    WARNING_WITH_USING_NO_TARGET: 'You are using a custom target platform, please ensure it is valid.',
    PALTFORM_DESCRIPTION:
        'If target platform is not set, Devtron will build image for architecture and operating system of the k8s node on which CI is running',
    PALTFORM_DESCRIPTION_WITH_NO_TARGET: 'Target platform is not set',
    TARGET_SELECTOR_MENU: 'Type to enter a target platform',
}

export const AUTO_DETECT = 'Autodetect'
export const VERSION_DETECT_OPTION = {
    label: AUTO_DETECT,
    value: AUTO_DETECT,
    infoText: 'Detect version during build time',
}
export const USE_CUSTOM_BUILDER = 'Use custom builder: Enter builder image tag'
export const CI_BUILDPACK_OPTION_TEXTS = {
    BuilderTippyContent: {
        heading: 'Builder',
        infoText:
            "A builder is an image that contains a set of buildpacks which provide your app's dependencies, a stack, and the OS layer for your app image.",
        documentationLinkText: 'View documentation',
        selectBuilder: 'Select a Builder',
        additionalContent: {
            label: 'If using custom builder, builder image should be:',
            listItems: [
                'publicly available OR',
                'available in selected container registry OR',
                'accessible from the build node',
            ],
        },
    },
    ProjectPathTippyContent: {
        label: 'Build Context (Relative)',
        heading: 'Project Path',
        infoText: 'In case of monorepo, specify the path of the GIT Repo for the deployment of the project.',
    },
    Language: 'Language',
    Version: 'Version',
}

export const BUILDER_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        boxShadow: 'none',
        backgroundColor: 'var(--bg-secondary)',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        marginTop: '0',
        minWidth: '226px',
    }),
}

export const RootBuildContext = './'

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

export const CREATE_DOCKER_FILE_LANGUAGE_OPTIONS_TEXT = {
    TITLE: 'Repo to place Dockerfile',
    TITLE_INFO: 'Dockerfile will be placed at the root of the selected repo path',
}
