import {
    DynamicDataTableRowDataType,
    DynamicDataTableRowType,
    TagType,
    TagsTableColumnsType,
} from '@devtron-labs/devtron-fe-common-lib'

export const parseLabels = (currentLabelTags: TagType[]): DynamicDataTableRowType<TagsTableColumnsType>[] =>
    currentLabelTags.map((currentLabelTag) => ({
        data: {
            tagKey: {
                value: currentLabelTag.key,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
            tagValue: {
                value: currentLabelTag.value,
                type: DynamicDataTableRowDataType.TEXT,
                props: {},
            },
        },
        id: (Date.now() * Math.random()).toString(16),
        customState: {
            propagateTag: currentLabelTag.propagate,
        },
    }))
