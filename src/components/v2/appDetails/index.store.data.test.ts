import { iNode, Node } from './appDetails.type';

export const nodesWithPodOnly = [
    {
        name: "pod1",
        kind: "Pod"
    } as iNode
]

export const nodesWithDeployment = [
    {
        name: "pod1",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet1",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet1",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment",
        kind: "Deployment"
    } as iNode
]

export const nodesWithStatefulSet = [
    {
        name: "pod1",
        kind: "Pod",
        parentRefs: [
            {
                group: "apps/v1",
                name: "StatefulSet1",
                kind: "StatefulSet"
            } as Node
        ]
    } as iNode,
    {
        group: "apps/v1",
        name: "StatefulSet1",
        kind: "StatefulSet"
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment",
        kind: "Deployment"
    } as iNode
]


export const nodesWithMultiDeployment = [
    {
        name: "pod1",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet1",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod2",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet2",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod3",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet3",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet1",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet2",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet3",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment2",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment",
        kind: "Deployment"
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment2",
        kind: "Deployment"
    } as iNode
]


export const nodesWithMultiDeploymentAndStatefulSet = [
    {
        name: "pod1",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet1",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod2",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet2",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod5",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet2",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod3",
        kind: "Pod",
        parentRefs: [
            {
                name: "ReplicaSet3",
                kind: "ReplicaSet"
            } as Node
        ]
    } as iNode,
    {
        name: "pod4",
        kind: "Pod",
        parentRefs: [
            {
                group: "apps/v1",
                name: "StatefulSet1",
                kind: "StatefulSet"
            } as Node
        ]
    } as iNode,
    {
        group: "apps/v1",
        name: "StatefulSet1",
        kind: "StatefulSet"
    } as iNode,
    {
        name: "ReplicaSet1",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet2",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        name: "ReplicaSet3",
        kind: "ReplicaSet",
        parentRefs: [
            {
                group: "apps/v1",
                name: "Deployment2",
                kind: "Deployment"
            } as Node
        ]
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment",
        kind: "Deployment"
    } as iNode,
    {
        group: "apps/v1",
        name: "Deployment2",
        kind: "Deployment"
    } as iNode
]

export const statefulSeWithChildren = [
    {
      group: "apps/v1",
      name: "StatefulSet1",
      kind: "StatefulSet",
      childNodes: [
        {
          childNodes: undefined,
          name: "pod4",
          kind: "Pod",
          parentRefs: [
            {
              group: "apps/v1",
              name: "StatefulSet1",
              kind: "StatefulSet"
            }
          ]
        }
      ]
    }
  ]

  export const ndesWithMultiDeploymentResponse = [
    {
      group: "apps/v1",
      name: "Deployment",
      kind: "Deployment",
      childNodes: [
        {
          name: "ReplicaSet1",
          kind: "ReplicaSet",
          parentRefs: [
            {
              group: "apps/v1",
              name: "Deployment",
              kind: "Deployment"
            }
          ],
          childNodes: [
            {
              childNodes: undefined,
              name: "pod1",
              kind: "Pod",
              parentRefs: [
                {
                  name: "ReplicaSet1",
                  kind: "ReplicaSet"
                }
              ]
            }
          ]
        },
        {
          name: "ReplicaSet2",
          kind: "ReplicaSet",
          parentRefs: [
            {
              group: "apps/v1",
              name: "Deployment",
              kind: "Deployment"
            }
          ],
          childNodes: [
            {
              childNodes: undefined,
              name: "pod2",
              kind: "Pod",
              parentRefs: [
                {
                  name: "ReplicaSet2",
                  kind: "ReplicaSet"
                }
              ]
            },
            {
              childNodes: undefined,
              name: "pod5",
              kind: "Pod",
              parentRefs: [
                {
                  "name": "ReplicaSet2",
                  "kind": "ReplicaSet"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      group: "apps/v1",
      name: "Deployment2",
      kind: "Deployment",
      childNodes: [
        {
          name: "ReplicaSet3",
          kind: "ReplicaSet",
          parentRefs: [
            {
              group: "apps/v1",
              name: "Deployment2",
              kind: "Deployment"
            }
          ],
          childNodes: [
            {
              childNodes: undefined,
              name: "pod3",
              kind: "Pod",
              parentRefs: [
                {
                  name: "ReplicaSet3",
                  kind: "ReplicaSet"
                }
              ]
            }
          ]
        }
      ]
    }
  ]