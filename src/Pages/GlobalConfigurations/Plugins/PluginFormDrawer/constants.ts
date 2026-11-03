import { ScriptType, SegmentType } from '@devtron-labs/devtron-fe-common-lib'

export const SCRIPT_TYPE_SEGMENTS: SegmentType<ScriptType>[] = [
    { label: 'Shell', value: ScriptType.SHELL },
    { label: 'Container image', value: ScriptType.CONTAINERIMAGE },
]

export const SELECTED_TASK_INDEX = 0
