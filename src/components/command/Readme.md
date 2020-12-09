## Routes

## Components 

##### CommandErrorBoundary 
`Root Component of Command. 
 Renders page header and routes`
##### Command
`Main Command bar component.`
- Always mounted with Navigation
- Marked active/inactive with prop isCommandBarActive
###### Props
| Props              | Description                       |
| ------------------ | --------------------------------- |
| isCommandBarActive | Shows or hides command bar        |
| toggleCommandBar   | Function to show/hide command bar |

###### State
| State                 | Description                                          |
| --------------------- | ---------------------------------------------------- |
| isLoading             | Shows loader or suggestedArguments                   |
| focussedArgument      | index of the focussed element in suggestedArguments  |
| argumentInput         | Argument input text. Works as suggestion filter      |
| isSuggestionError     | Shows/hides error on selection of invalid argument   |
| arguments             | All selected arguments, that makes a command         |
| tab                   | 'this-app' or 'jump-to'. Value of the selected tab   |
| command               | Array of first arguments                             |
| allSuggestedArguments | Readonly; Array of suggested suggestions             |
| suggestedArguments    | Array of suggested suggestions                       |
| groupName             | Name of the group to which suggestedArgument belongs |

Note: 
- Any argument that is not present is suggestedArgument is an invalid argument
- allSuggestedArguments is set when an element is added or removed from argument[]
- suggestedArguments is created from allSuggestedArguments via filtering
- isCommandBarActive is also used to make event listener active or inactive