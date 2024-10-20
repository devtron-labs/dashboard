```mermaid
graph TD;
  AppDetails-->SourceInfo;
  AppDetails-->Details;
  Details-->SourceInfo;
  Details-->NodeDetails;
  Details-->ProgressStatus;
  Details-->SyncError;
  Details-->AppMetrics;
  AppMetrics-->GenericChart;
  Details-->CommitInfo;
  NodeDetails-->NodeSelectors;
  NodeDetails-->EventsLogs;
  EventsLogs-->Events;
  EventsLogs-->Logs;
  EventsLogs-->Manifest;
```
