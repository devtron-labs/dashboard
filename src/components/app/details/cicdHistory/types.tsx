export interface CiMaterial {
    id: number
    gitMaterialId: number
    gitMaterialUrl: string
    gitMaterialName: string
    type: string
    value: string
    active: boolean
    lastFetchTime: string
    isRepoError: boolean
    repoErrorMsg: string
    isBranchError: boolean
    branchErrorMsg: string
    url: string
}

export interface ImageComment {
    id: number
    comment: string
    artifactId: number
}

export interface EmptyViewType {
    imgSrc?: string
    title: string
    subTitle: string
    link?: string
    linkText?: string
}
