import { GitAccountDTO } from '@Services/service.types'

import {
    CreateMaterialPayload,
    GitMaterialType,
    UpdateMaterialPayload,
    UpsertMaterialItemPayload,
} from './material.types'

export const getInitialMaterialFormState = (material?: GitMaterialType): GitMaterialType => {
    if (material) {
        return {
            id: material.id,
            name: material.name,
            gitProvider: material.gitProvider,
            url: material.url,
            checkoutPath: material.checkoutPath,
            includeExcludeFilePath: material.includeExcludeFilePath,
            active: material.active,
            fetchSubmodules: material.fetchSubmodules,
            isUsedInCiConfig: material.isUsedInCiConfig,
            isExcludeRepoChecked: material.isExcludeRepoChecked,
        }
    }
    return {
        gitProvider: undefined,
        url: '',
        checkoutPath: '',
        active: true,
        fetchSubmodules: false,
        includeExcludeFilePath: '',
        isExcludeRepoChecked: false,
    }
}

export const isGitProviderValid = (provider: GitAccountDTO): string => {
    if (provider?.id) {
        return undefined
    }
    return 'This is required field'
}

export function getUpsertMaterialPayload(
    appId: number,
    formMaterial: GitMaterialType,
    shouldCreateMaterial: boolean,
): CreateMaterialPayload | UpdateMaterialPayload {
    const basePayload: UpsertMaterialItemPayload = {
        url: formMaterial.url,
        checkoutPath: formMaterial.checkoutPath,
        filterPattern:
            !window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS && formMaterial.isExcludeRepoChecked
                ? formMaterial.includeExcludeFilePath
                      .trim()
                      .split(/\r?\n/)
                      .filter((path) => path.trim())
                : [],
        gitProviderId: formMaterial.gitProvider.id,
        fetchSubmodules: !!formMaterial.fetchSubmodules,
    }

    if (shouldCreateMaterial) {
        return {
            appId,
            material: [basePayload],
        }
    }

    return {
        appId,
        material: {
            ...basePayload,
            id: formMaterial.id,
        },
    }
}
