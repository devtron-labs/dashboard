```mermaid
graph TD;
  UserGroupContext-->UserGroupList;
  UserGroupList-->CollapsedUserGroup;
  UserGroupList-->AddUser;
  CollapsedUserGroup-->UserForm;
  CollapsedUserGroup-->GroupForm;
  UserForm-->EmailCreatable;
  UserForm-->SuperAdmin;
  UserForm-->GroupPermissions;
  UserForm-->DirectPermissions;
  UserForm-->ChartPermissions;
  GroupForm-->EmailCreatable;
  GroupForm-->SuperAdmin;
  GroupForm-->GroupPermissions;
  GroupForm-->DirectPermissions;
  GroupForm-->ChartPermissions;
```