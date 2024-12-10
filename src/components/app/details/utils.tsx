import {
    DynamicDataTableRowDataType,
    DynamicDataTableRowType,
    TagType,
    TagsTableColumnsType,
    getEmptyTagTableRow,
} from '@devtron-labs/devtron-fe-common-lib'

const parseLabels = (currentLabelTags: TagType[]): DynamicDataTableRowType<TagsTableColumnsType>[] =>
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

export const getLabelTags = (currentLabelTags: TagType[]) =>
    currentLabelTags?.length ? parseLabels(currentLabelTags) : [getEmptyTagTableRow()]
