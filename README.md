# Angular Dynamic Rule Builder

A flexible, configuration-driven component for building complex, nested query rules in Angular applications. Ideal for creating advanced search filters, coupon conditions, alert triggers, and more.

This component is built using modern Angular features, including Standalone Components, Signals, and OnPush change detection for optimal performance and a great developer experience.

![Component Screenshot](https://i.imgur.com/example.png) <!-- Placeholder Image -->

## Features

- **Nested Logic:** Create complex rules with nested `AND`/`OR` condition groups.
- **Dynamic Field Configuration:** Define all fields, their types, and available operators via a simple configuration object.
- **Multiple Input Types:** Supports `text`, `number`, `date`, `boolean`, and `select` dropdowns out of the box.
- **Asynchronous Data Loading:** The `select` input type supports async, paginated data fetching with typeahead search.
- **Forms Integration:** Implements `ControlValueAccessor` for seamless use with `[(ngModel)]` and reactive forms.
- **Modern Angular:** Built with Standalone Components, Signals, and OnPush change detection.
- **Minimal Dependencies:** Relies only on the excellent `@ng-select/ng-select` for advanced dropdown functionality.

## Installation

To use this library, install it via npm (or your preferred package manager):

```bash
npm install angular-condition-builder @ng-select/ng-select
```

## Setup

1.  **Import the Component:** Since the component is `standalone`, you can import it directly into the `imports` array of your component or module.

    ```typescript
    import { RuleBuilderComponent } from 'angular-dynamic-rule-builder';

    @Component({
      // ...
      standalone: true,
      imports: [
        RuleBuilderComponent,
        FormsModule // Required for ngModel
      ],
    })
    export class YourComponent {}
    ```

2.  **Add Styles for ng-select:** The library uses `@ng-select/ng-select`, which requires its theme CSS to be included in your application. Add the following to your `angular.json` styles array or `index.html`.

    ```json
    // angular.json
    "styles": [
      "src/styles.css",
      "./node_modules/@ng-select/ng-select/themes/default.theme.css"
    ]
    ```
    OR
    ```html
    <!-- index.html -->
    <link rel="stylesheet" href="https://unpkg.com/@ng-select/ng-select@latest/themes/default.theme.css" />
    ```

## Usage

Using the rule builder involves two main steps: creating a configuration object and adding the component to your template.

### 1. Component Configuration (`.ts`)

In your component's TypeScript file, define the `RuleBuilderConfig` and the initial state for your rules.

```typescript
import { Component, signal } from '@angular/core';
import { ConditionGroup, RuleBuilderConfig, Field, Operator, FieldSource, PaginatedResponse } from 'angular-dynamic-rule-builder';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
})
export class ExampleComponent {

  // The rule structure for our form, bound with ngModel
  rules = signal<ConditionGroup>({
    id: 'root',
    operator: 'AND',
    conditions: [],
  });
  
  // Configuration for the rule builder, passed as an input.
  ruleBuilderConfig: RuleBuilderConfig;

  constructor() {
    this.ruleBuilderConfig = {
      fields: this.getFields(),
      fetchOptions: this.fetchOptions.bind(this)
    };
  }

  // Define the fields available in the rule builder
  private getFields(): Field[] {
    return [
      { id: 'customer_name', name: 'Customer Name', type: 'text', operators: [Operator.CONTAINS, Operator.EQUALS] },
      { id: 'order_count', name: 'Order Count', type: 'number', operators: [Operator.GREATER_THAN, Operator.EQUALS] },
      { id: 'last_login', name: 'Last Login Date', type: 'date', operators: [Operator.LESS_THAN] },
      { id: 'is_active', name: 'Is Active', type: 'boolean', operators: [Operator.EQUALS] },
      {
        id: 'customer_id',
        name: 'Customer',
        type: 'select',
        operators: [Operator.EQUALS, Operator.NOT_EQUALS],
        source: {
          apiUrl: '/api/customers',
          valueField: 'id',
          labelField: 'name',
        },
      },
    ];
  }

  // Implement the data fetching logic for 'select' fields
  private fetchOptions(source: FieldSource, page: number, term: string): Observable<PaginatedResponse<any>> {
    console.log(`Fetching from ${source.apiUrl} page ${page} with term "${term}"`);
    
    // In a real app, this would be an HTTP request
    const allCustomers = [
        { id: 'user_1', name: 'John Doe' },
        { id: 'user_2', name: 'Jane Smith' },
        // ... more users
    ];
    const filtered = allCustomers.filter(c => c.name.toLowerCase().includes(term.toLowerCase()));
    
    return of({
        results: filtered,
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: filtered.length,
      }).pipe(delay(500));
  }
}
```

### 2. Template Integration (`.html`)

Add the component to your template and bind the configuration and `ngModel`.

```html
<main class="p-8">
  <app-rule-builder 
    [config]="ruleBuilderConfig"
    title="Marketing Campaign Rules"
    description="Define the conditions for customers to be included in this campaign."
    [(ngModel)]="rules"
  >
  </app-rule-builder>

  <!-- You can display the output for debugging -->
  <div class="mt-8">
    <h3>Live Rule Output:</h3>
    <pre><code>{{ rules() | json }}</code></pre>
  </div>
</main>
```

## API Reference

### Component: `app-rule-builder`

| Property        | Type                  | Description                                                                                             |
|-----------------|-----------------------|---------------------------------------------------------------------------------------------------------|
| **Inputs**      |                       |                                                                                                         |
| `config`        | `RuleBuilderConfig`   | **Required.** The configuration object that defines fields and data fetching logic.                       |
| `title`         | `string`              | An optional title to display at the top of the builder.                                                 |
| `description`   | `string`              | An optional description to display below the title.                                                     |
| **Outputs**     |                       |                                                                                                         |
| `ruleChange`    | `EventEmitter<ConditionGroup>` | Emits the complete `ConditionGroup` object every time a rule is changed. Useful if you are not using `ngModel`. |
| **`[(ngModel)]`** | `ConditionGroup`      | Provides two-way data binding for the rule structure.                                                   |

### Configuration: `RuleBuilderConfig`

| Property       | Type                  | Description                                                                 |
|----------------|-----------------------|-----------------------------------------------------------------------------|
| `fields`       | `Field[]`             | **Required.** An array of `Field` objects that users can select from.         |
| `fetchOptions` | `FetchOptionsFn`      | **Required.** A function to handle data fetching for `select` type fields.    |


## Peer Dependencies

Your project must have the following packages installed:

- `@angular/core`
- `@angular/common`
- `@angular/forms`
- `@ng-select/ng-select`
- `rxjs`
