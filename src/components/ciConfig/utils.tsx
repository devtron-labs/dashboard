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

export const getSelectStartIcon = (icon: string, label: string) => {
    if (!icon) {
        return null
    }
    return <img src={icon} alt={label} className="icon-dim-20 mr-8" />
}
