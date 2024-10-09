import { JSONPath } from 'jsonpath-plus'
import YAML from 'yaml'
import { applyOperation, Operation } from 'fast-json-patch'
import { convertJSONPointerToJSONPath, noop, RJSFFormSchema } from '@devtron-labs/devtron-fe-common-lib'
import { NodeEntityType, NodeType, TraversalType, UpdateNodeForPathDataType } from './types'

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

function getArrayItems(items: Record<'type' | 'properties', unknown>) {
    if (items.type === 'object') {
        return items.properties
    }
    return items
}

function _constructTree(key: string, path: string, json: RJSFFormSchema): NodeType {
    if (!json) {
        // Maybe throw error ?
        throw new ViewError('Problem constructing the tree', 'In traversal found an undefined json object')
    }

    const isArray =
        json.type === 'array' &&
        json.items &&
        typeof json.items === 'object' &&
        !Array.isArray(json.items) &&
        (json.items as Record<'type', unknown>).type === 'object'
    const isObject = json.type === 'object' && json.properties && typeof json.properties === 'object'

    if (isArray || isObject) {
        // @ts-ignore
        const children = Object.entries(isArray ? getArrayItems(json.items) : json.properties)
            .sort(([, child]) => (child.type === 'boolean' ? -1 : 0))
            .map(([childKey, child]: [string, RJSFFormSchema]) =>
                _constructTree.call(this, childKey, isArray ? `${path}/*/${childKey}` : `${path}/${childKey}`, child),
            )

        const selectionStatus = getSelectionStatus(children)

        return {
            key,
            selectionStatus,
            type: isArray ? NodeEntityType.ARRAY : NodeEntityType.OBJECT,
            fieldType: json.type,
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
        fieldType: json.type,
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

/**
 * Can throw error while parsing schema & json
 * @param schema (string) the json schema
 * @param json (string) the corresponding json
 */
export function GUIViewModel(schema: string, json: string) {
    this.schema = YAML.parse(schema)
    this.json = YAML.parse(json)
    this.totalCheckedCount = 0
    this.root = constructTree.apply(this)
}

GUIViewModel.prototype.getRoot = function getRoot() {
    return this.root
}

function inOrder(props: TraversalType) {
    const { node, wf } = props
    if (!props.node) {
        return
    }
    wf(node, props.data)
    node.children?.forEach((child) => inOrder({ ...props, node: child }))
}

function postOrder(props: TraversalType) {
    const { node, wf } = props
    if (!props.node) {
        return
    }
    node.children?.forEach((child) => postOrder({ ...props, node: child }))
    wf(node, props.data)
}

const getOperationPathForAddOperation = (path: string) => {
    const lastWildcardLocation = path.lastIndexOf('*')
    const firstPart = path.slice(0, lastWildcardLocation + 1)
    const lastPart = path.slice(lastWildcardLocation + 1)
    return { firstPart, lastPart }
}

function applyJsonPatchOperationAndMutateJson(json: object, op: Operation) {
    try {
        let paths: Array<string> = []

        if (op.op === 'add') {
            const { firstPart, lastPart } = getOperationPathForAddOperation(op.path)
            paths = JSONPath({
                json,
                path: convertJSONPointerToJSONPath(firstPart),
                resultType: 'pointer',
            }).map((path: string) => `${path}${lastPart}`)
        } else {
            paths = JSONPath({
                json,
                path: convertJSONPointerToJSONPath(op.path),
                resultType: 'pointer',
            })
        }

        if (!Array.isArray(paths)) {
            return
        }

        paths.forEach((path) => applyOperation(json, { ...op, path }, true, true))
    } catch {
        noop()
    }
}

function getNullValueFromType(type: NodeType['fieldType']) {
    switch (type) {
        case 'number':
        case 'integer':
            return 0
        case 'string':
            return ''
        case 'boolean':
            return false
        case 'object':
            return {}
        case 'array':
            return []
        case 'null':
        default:
            return null
    }
}

function updateNodeWherePathMatches(node: NodeType, { path, json }: UpdateNodeForPathDataType) {
    if (node.path === path) {
        if (node.type !== NodeEntityType.LEAF) {
            throw new Error('None leaf is being updated!')
        }
        // eslint-disable-next-line no-param-reassign
        node.isChecked = !node.isChecked

        if (node.isChecked) {
            this.totalCheckedCount += 1
            applyJsonPatchOperationAndMutateJson(json, {
                op: 'add',
                path: node.path,
                value: getNullValueFromType(node.fieldType),
            })
        } else {
            this.totalCheckedCount -= 1
            applyJsonPatchOperationAndMutateJson(json, { op: 'remove', path: node.path })
        }
    }

    if (node.children) {
        // eslint-disable-next-line no-param-reassign
        node.selectionStatus = getSelectionStatus(node.children)
    }
}

function addPathToListIfUnchecked(node: NodeType, data: Array<string>) {
    if ((Object.hasOwn(node, 'isChecked') && !node.isChecked) || node.selectionStatus === 'none-selected') {
        data.push(node.path)
    }
}

GUIViewModel.prototype.getUncheckedNodes = function getUncheckedNodes(): string[] {
    const list = []
    inOrder({ node: this.root, wf: addPathToListIfUnchecked.bind(this), data: list })
    return list
}

GUIViewModel.prototype.updateNodeForPath = function updateNodeForPath({ path, json }: UpdateNodeForPathDataType) {
    const clone = structuredClone(json)
    postOrder({ node: this.root, wf: updateNodeWherePathMatches.bind(this), data: { path, json: clone } })
    return clone
}

GUIViewModel.prototype.inOrder = inOrder
GUIViewModel.prototype.postOrder = postOrder
