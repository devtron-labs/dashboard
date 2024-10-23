import { Node, NodeFilters } from '@devtron-labs/devtron-fe-common-lib'

export const doesNodeSatisfiesFilter = (node: Node, filter: string) =>
    node.health?.status.toLowerCase() === filter || (filter === NodeFilters.drifted && node.hasDrift)
