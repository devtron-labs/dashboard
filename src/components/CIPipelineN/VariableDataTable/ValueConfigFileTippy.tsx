import Tippy from '@tippyjs/react'

import { VariableType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Info } from '@Icons/info-filled.svg'

export const ValueConfigFileTippy = ({ fileMountDir }: Pick<VariableType, 'fileMountDir'>) => (
    <Tippy
        trigger="click"
        arrow={false}
        className="default-tt w-200"
        content={
            <div className="fs-12 lh-18 flexbox-col dc__gap-2">
                <p className="m-0 fw-6 cn-0">File mount path</p>
                <p className="m-0 cn-50">
                    {fileMountDir}
                    <br />
                    <br />
                    Ensure the uploaded file name is unique to avoid conflicts or overrides.
                </p>
            </div>
        }
    >
        <div className="cursor flex">
            <Info className="icon-dim-18 info-icon-n6" />
        </div>
    </Tippy>
)
