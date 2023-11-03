# DASHBOARD CONFIG PARAMETER

| Key                               | Value     | Description                                     |
|-----------------------------------|-----------|-------------------------------------------------|
| APPLICATION_METRICS_ENABLED        | "true"    | Show application metrics button                |
| HIDE_APPLICATION_GROUPS            | "false"   | Hide application group from Devtron UI         |
| HIDE_DISCORD                       | "true"    | Hide Discord button from UI                    |
| HIDE_GITOPS_OR_HELM_OPTION         | "false"   | Enable GitOps and Helm option                 |
| HOTJAR_ENABLED                     | "false"   | Hotjar integration status                      |
| POSTHOG_ENABLED                    | "true"    | PostHog integration status                     |
| POSTHOG_TOKEN                      | XXXXXXXX  | PostHog API token                        |
| SENTRY_ENABLED                     | "false"   | Sentry integration status                      |
| SENTRY_ENV                         | stage     | Sentry environment                              |
| SENTRY_ERROR_ENABLED               | false     |  To send uncaught errors to sentry             |
| SENTRY_PERFORMANCE_ENABLED         | false     |  To send persormance sentry      | 
| SENTRY_DSN                         | ''        | SENTRY Data Source Name |
| SENTRY_TRACES_SAMPLE_RATE          | 0.2       | Rate at which data send to sentry.(min=0 max=1)|
| USE_V2                             | "true"    | Use the v2 APIs                                 |
| ENABLE_RESTART_WORKLOAD            | "false"    | Show restart pods option in app details page   |
| ENABLE_BUILD_CONTEXT               | "true"    | Enable build context in Devtron UI             |
| FORCE_SECURITY_SCANNING            | "false"   | Force security scanning                         |
| GA_ENABLED                         | "true"    | Enable Google Analytics (GA)                   |
| GA_TRACKING_ID                     | G-XXXXXXXX | Google Analytics tracking ID                 |
| ENABLE_SCOPED_VARIABLES            | "false" | For enabling scoped variable from UI, also need to enable it in backend.          |
| RECOMMEND_SECURITY_SCANNING        | "false"    | Recommend security scanning                  |
| FORCE_SECURITY_SCANNING            | "false"    |  Force Security Scanning                |
| CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL     | 7000    |  Interval for checking connection with cluster terminal.     |

# DASHBOARD CONFIG SECRET
