import { getGitProviderIcon } from '@Components/common'

export const getGitRepositoryOptions = (sourceMaterials) =>
    sourceMaterials.map((material) => ({
        ...material,
        value: material.url,
        label: material.name,
        startIcon: getGitProviderIcon(material.url),
    }))

export const getLanguageOptions = (languages) =>
    languages.map((_language) => ({
        value: _language.value.label,
        label: _language.value.label,
        startIcon: _language.value.icon,
    }))
