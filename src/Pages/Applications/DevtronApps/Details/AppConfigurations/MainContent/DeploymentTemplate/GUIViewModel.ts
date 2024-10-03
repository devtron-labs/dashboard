import { convertJSONPointerToJSONPath, RJSFFormSchema } from '@devtron-labs/devtron-fe-common-lib'
import { JSONPath } from 'jsonpath-plus'
import YAML from 'yaml'

export enum NodeEntityType {
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    LEAF = 'LEAF',
}

export type NodeType =
    | {
          key: string
          title: string
          path: string
          type: NodeEntityType
          selectionStatus: 'all-selected' | 'some-selected' | 'none-selected'
          isChecked?: never
          children: Array<NodeType>
      }
    | {
          key: string
          title: string
          path: string
          type: NodeEntityType.LEAF
          isChecked: boolean
          selectionStatus?: never
          children?: never
      }

export function ViewError(title: string, subTitle: string) {
    this.title = title
    this.subTitle = subTitle
}

function getSelectionStatus(children: NodeType['children']): NodeType['selectionStatus'] {
    const map = children.reduce(
        (record: Record<NodeType['selectionStatus'], number>, curr: NodeType) => {
            if (curr.selectionStatus) {
                // eslint-disable-next-line no-param-reassign
                record[curr.selectionStatus] += 1
            } else {
                // eslint-disable-next-line no-param-reassign
                record[curr.isChecked ? 'all-selected' : 'none-selected'] += 1
            }

            return record
        },
        { 'none-selected': 0, 'all-selected': 0, 'some-selected': 0 } as Record<NodeType['selectionStatus'], number>,
    )

    if (map['all-selected'] === children.length) {
        return 'all-selected'
    }

    if (map['none-selected'] === children.length) {
        return 'none-selected'
    }

    return 'some-selected'
}

function hasCorrespondingValueInYaml(json: object, path: string) {
    try {
        return (
            JSONPath({
                json,
                path: convertJSONPointerToJSONPath(path),
                resultType: 'value',
                wrap: false,
            }) !== undefined
        )
    } catch {
        return null
    }
}

function _constructTree(key: string, path: string, json: RJSFFormSchema): NodeType {
    if (!json) {
        // Maybe throw error ?
        throw new ViewError('Problem constructing the tree', 'In traversal found an undefined json object')
    }

    const isArray = json.type === 'array' && json.items && typeof json.items === 'object'
    const isObject = json.type === 'object' && json.properties && typeof json.properties === 'object'

    if (isArray || isObject) {
        // @ts-ignore
        const children = Object.entries(isArray ? json.items.properties : json.properties).map(
            ([childKey, child]: [string, RJSFFormSchema]) =>
                _constructTree.call(this, childKey, isArray ? `${path}/*/${childKey}` : `${path}/${childKey}`, child),
        )

        const selectionStatus = getSelectionStatus(children)

        return {
            key,
            selectionStatus,
            type: isArray ? NodeEntityType.ARRAY : NodeEntityType.OBJECT,
            title: json.title ?? key,
            path,
            children,
        }
    }

    const isChecked = hasCorrespondingValueInYaml(this.json, path)

    if (isChecked) {
        this.totalCheckedCount += 1
    }

    return {
        key,
        type: NodeEntityType.LEAF,
        isChecked,
        title: json.title,
        path,
    }
}

function constructTree() {
    if (this.schema.type !== 'object' || !this.schema.properties || this.schema.properties === undefined) {
        throw new Error('Root type definition is not object!')
    }

    return _constructTree.apply(this, ['', '', this.schema])
}

export function GUIViewModel(schema: string, json: string) {
    // TODO: try catch
    this.schema = YAML.parse(schema)
    this.json = YAML.parse(json)
    this.totalCheckedCount = 0
    this.root = constructTree.apply(this)
}

GUIViewModel.prototype.getRoot = function getRoot() {
    return this.root
}

type traversalType = {
    node: NodeType
    wf: (node: NodeType, data: unknown) => void
    data: unknown
}

function inOrder(props: traversalType) {
    const { node, wf } = props
    if (!props.node) {
        return
    }
    wf(node, props.data)
    node.children?.forEach((child) => inOrder({ ...props, node: child }))
}

function postOrder(props: traversalType) {
    const { node, wf } = props
    if (!props.node) {
        return
    }
    node.children?.forEach((child) => inOrder({ ...props, node: child }))
    wf(node, props.data)
}

function updateNodeWherePathMatches(node: NodeType, data: string) {
    if (node.path === data) {
        if (node.type !== NodeEntityType.LEAF) {
            throw new Error('None leaf is being updated!')
        }
        // eslint-disable-next-line no-param-reassign
        node.isChecked = !node.isChecked

        if (node.isChecked) {
            this.totalCheckedCount += 1
        } else {
            this.totalCheckedCount -= 1
        }
    }

    if (node.children) {
        // eslint-disable-next-line no-param-reassign
        node.selectionStatus = getSelectionStatus(node.children)
    }
}

function addPathToListIfUnchecked(node: NodeType, data: Array<string>) {
    if ((node.isChecked && !node.isChecked) || node.selectionStatus === 'none-selected') {
        data.push(node.path)
    }
}

GUIViewModel.prototype.getUncheckedNodes = function getUncheckedNodes(): string[] {
    const list = []
    inOrder({ node: this.root, wf: addPathToListIfUnchecked.bind(this), data: list })
    return list
}

GUIViewModel.prototype.updateNodeForPath = function updateNodeForPath(path: string) {
    postOrder({ node: this.root, wf: updateNodeWherePathMatches.bind(this), data: path })
}

GUIViewModel.prototype.inOrder = inOrder
GUIViewModel.prototype.postOrder = postOrder
