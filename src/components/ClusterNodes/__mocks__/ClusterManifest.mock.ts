import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export const ClusterManifestResponse = { manifest: {
      "apiVersion": "v1",
      "kind": "Pod",
      "metadata": {
          "annotations": {
              "cni.projectcalico.org/podIP": "10.1.62.237/32",
              "cni.projectcalico.org/podIPs": "10.1.62.237/32"
          },
          "creationTimestamp": "2023-05-09T13:09:27Z",
          "managedFields": [
              {
                  "apiVersion": "v1",
                  "fieldsType": "FieldsV1",
                  "fieldsV1": {
                      "f:spec": {
                          "f:containers": {
                              "k:{\"name\":\"devtron-debug-terminal\"}": {
                                  ".": {},
                                  "f:args": {},
                                  "f:command": {},
                                  "f:image": {},
                                  "f:imagePullPolicy": {},
                                  "f:name": {},
                                  "f:resources": {},
                                  "f:terminationMessagePath": {},
                                  "f:terminationMessagePolicy": {}
                              }
                          },
                          "f:dnsPolicy": {},
                          "f:enableServiceLinks": {},
                          "f:nodeSelector": {},
                          "f:restartPolicy": {},
                          "f:schedulerName": {},
                          "f:securityContext": {},
                          "f:serviceAccount": {},
                          "f:serviceAccountName": {},
                          "f:terminationGracePeriodSeconds": {},
                          "f:tolerations": {}
                      }
                  },
                  "manager": "Go-http-client",
                  "operation": "Update",
                  "time": "2023-05-09T13:09:27Z"
              },
              {
                  "apiVersion": "v1",
                  "fieldsType": "FieldsV1",
                  "fieldsV1": {
                      "f:metadata": {
                          "f:annotations": {
                              ".": {},
                              "f:cni.projectcalico.org/podIP": {},
                              "f:cni.projectcalico.org/podIPs": {}
                          }
                      }
                  },
                  "manager": "calico",
                  "operation": "Update",
                  "subresource": "status",
                  "time": "2023-05-09T13:09:27Z"
              },
              {
                  "apiVersion": "v1",
                  "fieldsType": "FieldsV1",
                  "fieldsV1": {
                      "f:status": {
                          "f:conditions": {
                              "k:{\"type\":\"ContainersReady\"}": {
                                  ".": {},
                                  "f:lastProbeTime": {},
                                  "f:lastTransitionTime": {},
                                  "f:status": {},
                                  "f:type": {}
                              },
                              "k:{\"type\":\"Initialized\"}": {
                                  ".": {},
                                  "f:lastProbeTime": {},
                                  "f:lastTransitionTime": {},
                                  "f:status": {},
                                  "f:type": {}
                              },
                              "k:{\"type\":\"Ready\"}": {
                                  ".": {},
                                  "f:lastProbeTime": {},
                                  "f:lastTransitionTime": {},
                                  "f:status": {},
                                  "f:type": {}
                              }
                          },
                          "f:containerStatuses": {},
                          "f:hostIP": {},
                          "f:phase": {},
                          "f:podIP": {},
                          "f:podIPs": {
                              ".": {},
                              "k:{\"ip\":\"10.1.62.237\"}": {
                                  ".": {},
                                  "f:ip": {}
                              }
                          },
                          "f:startTime": {}
                      }
                  },
                  "manager": "kubelite",
                  "operation": "Update",
                  "subresource": "status",
                  "time": "2023-05-09T13:09:28Z"
              }
          ],
          "name": "terminal-access-1-2-1",
          "namespace": "default",
          "resourceVersion": "29693218",
          "selfLink": "/api/v1/namespaces/default/pods/terminal-access-1-2-1",
          "uid": "daeb25c7-7742-40de-bad2-1920506a4355"
      },
      "spec": {
          "containers": [
              {
                  "args": [
                      "while true; do sleep 600; done;"
                  ],
                  "command": [
                      "/bin/sh",
                      "-c",
                      "--"
                  ],
                  "image": "quay.io/devtron/ubuntu-k8s-utils:1.22",
                  "imagePullPolicy": "IfNotPresent",
                  "name": "devtron-debug-terminal",
                  "resources": {},
                  "terminationMessagePath": "/dev/termination-log",
                  "terminationMessagePolicy": "File",
                  "volumeMounts": [
                      {
                          "mountPath": "/var/run/secrets/kubernetes.io/serviceaccount",
                          "name": "kube-api-access-lnm7p",
                          "readOnly": true
                      }
                  ]
              }
          ],
          "dnsPolicy": "ClusterFirst",
          "enableServiceLinks": true,
          "nodeName": "demo-new2",
          "nodeSelector": {
              "kubernetes.io/hostname": "demo-new2"
          },
          "preemptionPolicy": "PreemptLowerPriority",
          "priority": 0,
          "restartPolicy": "Always",
          "schedulerName": "default-scheduler",
          "securityContext": {},
          "serviceAccount": "terminal-access-1-2-1-sa",
          "serviceAccountName": "terminal-access-1-2-1-sa",
          "terminationGracePeriodSeconds": 30,
          "tolerations": [
              {
                  "effect": "NoSchedule",
                  "key": "kubernetes.azure.com/scalesetpriority",
                  "operator": "Equal",
                  "value": "spot"
              },
              {
                  "effect": "NoExecute",
                  "key": "node.kubernetes.io/not-ready",
                  "operator": "Exists",
                  "tolerationSeconds": 300
              },
              {
                  "effect": "NoExecute",
                  "key": "node.kubernetes.io/unreachable",
                  "operator": "Exists",
                  "tolerationSeconds": 300
              }
          ],
          "volumes": [
              {
                  "name": "kube-api-access-lnm7p",
                  "projected": {
                      "defaultMode": 420,
                      "sources": [
                          {
                              "serviceAccountToken": {
                                  "expirationSeconds": 3607,
                                  "path": "token"
                              }
                          },
                          {
                              "configMap": {
                                  "items": [
                                      {
                                          "key": "ca.crt",
                                          "path": "ca.crt"
                                      }
                                  ],
                                  "name": "kube-root-ca.crt"
                              }
                          },
                          {
                              "downwardAPI": {
                                  "items": [
                                      {
                                          "fieldRef": {
                                              "apiVersion": "v1",
                                              "fieldPath": "metadata.namespace"
                                          },
                                          "path": "namespace"
                                      }
                                  ]
                              }
                          }
                      ]
                  }
              }
          ]
      },
      "status": {
          "conditions": [
              {
                  "lastProbeTime": null,
                  "lastTransitionTime": "2023-05-09T13:09:27Z",
                  "status": "True",
                  "type": "Initialized"
              },
              {
                  "lastProbeTime": null,
                  "lastTransitionTime": "2023-05-09T13:09:28Z",
                  "status": "True",
                  "type": "Ready"
              },
              {
                  "lastProbeTime": null,
                  "lastTransitionTime": "2023-05-09T13:09:28Z",
                  "status": "True",
                  "type": "ContainersReady"
              },
              {
                  "lastProbeTime": null,
                  "lastTransitionTime": "2023-05-09T13:09:27Z",
                  "status": "True",
                  "type": "PodScheduled"
              }
          ],
          "containerStatuses": [
              {
                  "containerID": "containerd://ee55355a983f6d670330cea4c333a690fa068949239b3044369030aba7f25372",
                  "image": "quay.io/devtron/ubuntu-k8s-utils:1.22",
                  "imageID": "quay.io/devtron/ubuntu-k8s-utils@sha256:b57144dcb15561bc753f931cfce0a0fa23bfd33a48d5825a14c175bf641a7862",
                  "lastState": {},
                  "name": "devtron-debug-terminal",
                  "ready": true,
                  "restartCount": 0,
                  "started": true,
                  "state": {
                      "running": {
                          "startedAt": "2023-05-09T13:09:28Z"
                      }
                  }
              }
          ],
          "hostIP": "10.0.0.4",
          "phase": "Running",
          "podIP": "10.1.62.237",
          "podIPs": [
              {
                  "ip": "10.1.62.237"
              }
          ],
          "qosClass": "BestEffort",
          "startTime": "2023-05-09T13:09:27Z"
      }
  } }



export async function clusterManifestResponse(): Promise<ResponseType> {
    const response = {
        code: 200,
        status: 'OK',
        result: ClusterManifestResponse,
    }
    return response
}
