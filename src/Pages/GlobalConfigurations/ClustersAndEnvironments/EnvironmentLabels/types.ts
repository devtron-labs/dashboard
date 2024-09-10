import { TagType } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, MouseEvent, SetStateAction } from 'react'

export interface EnvironmentLabelTextProps {
    heading: string
    description: string
}

export interface EnvironmentLabelsProps {
    tags: TagType[]
    setTags: Dispatch<SetStateAction<TagType[]>>
    isLoading?: boolean
    isError?: boolean
    error?: string
    addLabel?: (e: MouseEvent<HTMLButtonElement>) => void
    reload?: (e: MouseEvent<HTMLButtonElement>) => void
}

export interface EnvironmentLabelTagsProps extends Pick<EnvironmentLabelsProps, 'tags' | 'setTags'> {}
