import { MouseEvent } from 'react'

import { ServerErrors, TagType } from '@devtron-labs/devtron-fe-common-lib'

export interface EnvironmentLabelTextProps {
    heading: string
    description: string
}

export interface EnvironmentLabelsProps {
    tags: TagType[]
    setTags: (tags: TagType[]) => void
    isLoading?: boolean
    error?: ServerErrors
    addLabel?: (e: MouseEvent<HTMLButtonElement>) => void
    reload?: (e: MouseEvent<HTMLButtonElement>) => void
}

export interface EnvironmentLabelTagsProps extends Pick<EnvironmentLabelsProps, 'tags' | 'setTags'> {}
