import { CIMaterialType } from '@devtron-labs/devtron-fe-common-lib'

import { RegexValueType } from './types'

export const getInitialRegexValue = (materials: CIMaterialType[]) => {
    const initialValue: Record<number, RegexValueType> = {}
    materials.forEach((mat) => {
        initialValue[mat.gitMaterialId] = {
            value: mat.value,
            isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
        }
    })
    return initialValue
}
