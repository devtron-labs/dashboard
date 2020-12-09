## Routes

## Components 

##### CommandErrorBoundary 
`Wrapper for Command Component.`
##### Command
`Main Command bar component.`
- Always mounted in Navigation
- Marked active/inactive via prop isCommandBarActive
###### Props
| Props              | Description                       |
| ------------------ | --------------------------------- |
| isCommandBarActive | Shows or hides command bar        |
| toggleCommandBar   | Function to show/hide command bar |

###### State
| State                 | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| isLoading             | Shows loader or suggestedArguments                                         |
| focussedArgument      | index of the focussed element in suggestedArguments                        |
| argumentInput         | Argument input text. Works as suggestion filter                            |
| isSuggestionError     | Shows/hides error on selection of invalid argument                         |
| arguments             | All selected arguments, that makes a command                               |
| tab                   | 'this-app' or 'jump-to'. Value of the selected tab                         |
| command               | Array of first arguments                                                   |
| allSuggestedArguments | Readonly. Set when an element is added or removed from argument[]          |
| suggestedArguments    | Used to show suggestions. Created from allSuggestedArguments via filtering |
| groupName             | Name of the group to which suggestedArgument belongs                       |

Note: 
- Any argument that is not present is suggestedArgument is an invalid argument
- isCommandBarActive is also used to make event listener active or inactive