import { getGitProviderIcon } from '@Components/common'
import { MaterialOptionType } from './types'

export const getGitRepositoryOptions = (sourceMaterials: MaterialOptionType[]) =>
    sourceMaterials.map((material) => ({
        ...material,
        value: material.url,
        label: material.name,
        startIcon: getGitProviderIcon(material.url),
    }))

export const getSelectStartIcon = (icon: string, label: string) => {
    if (!icon) {
        return null
    }
    return <img src={icon} alt={label} className="icon-dim-20 mr-8" />
}
