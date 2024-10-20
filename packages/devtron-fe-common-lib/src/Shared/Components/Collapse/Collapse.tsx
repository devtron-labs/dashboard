import { CollapseProps } from './types'

export const Collapse = ({ expand, children }: CollapseProps) => (
    // TODO: removed animation because of miscalculations (broken with auto editor height)
    <div>{expand ? children : null}</div>
)
