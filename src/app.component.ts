import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RuleBuilderComponent, RuleBuilderConfig, Operator, Field, FieldSource, PaginatedResponse, ConditionGroup } from './rule-builder/public-api';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RuleBuilderComponent, FormsModule],
})
export class AppComponent {

  // The rule structure for our form, bound with ngModel
  rules = signal<ConditionGroup>({
    id: 'root',
    operator: 'AND',
    conditions: [],
  });
  
  builderTitle = 'Dynamic Rule Builder';
  builderDescription = 'Use the interface below to construct a set of conditions.';

  // Configuration for the rule builder, passed as an input.
  // This makes the library component reusable.
  ruleBuilderConfig: RuleBuilderConfig;

  constructor() {
    this.ruleBuilderConfig = {
      fields: this.getFields(),
      fetchOptions: this.fetchOptions.bind(this)
    };
  }

  onRuleChange(value: ConditionGroup) {
    console.log('Rules changed:', value);
    // The signal `rules` is already updated by [(ngModel)]
  }

  private getFields(): Field[] {
    return [
      {
        id: 'customer_name',
        name: 'Customer Name',
        type: 'text',
        operators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.DOES_NOT_CONTAIN, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
      },
      {
        id: 'customer_email',
        name: 'Customer Email',
        type: 'text',
        operators: [Operator.CONTAINS, Operator.DOES_NOT_CONTAIN, Operator.EQUALS, Operator.NOT_EQUALS],
      },
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
      {
        id: 'order_count',
        name: 'Order Count',
        type: 'number',
        operators: [Operator.EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN],
      },
       {
        id: 'is_active',
        name: 'Is Active',
        type: 'boolean',
        operators: [Operator.EQUALS],
      },
      {
        id: 'last_login',
        name: 'Last Login Date',
        type: 'date',
        operators: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
      },
    ];
  }

  // This function implements the data fetching logic.
  // In a real app, this would make an HTTP request.
  private fetchOptions(source: FieldSource, page: number, term: string): Observable<PaginatedResponse<any>> {
    console.log(`Fetching from ${source.apiUrl} page ${page} with term "${term}"`);

    if (source.apiUrl === '/api/customers') {
      const allCustomers = [
        { id: '68e80f7aa47e7b7821168cdb', name: 'Dai Toan', email: 'nguyentoan10@gmail.com' },
        { id: 'user_2', name: 'Jane Smith', email: 'jane.s@example.com' },
        { id: 'user_3', name: 'Peter Jones', email: 'peter.j@example.com' },
        { id: 'user_4', name: 'Mary Johnson', email: 'mary.j@example.com' },
        { id: 'user_5', name: 'Chris Lee', email: 'chris.l@example.com' },
        { id: 'user_6', name: 'Patricia Brown', email: 'pat.b@example.com' },
        { id: 'user_7', name: 'Robert Williams', email: 'rob.w@example.com' },
        { id: 'user_8', name: 'Linda Davis', email: 'linda.d@example.com' },
      ];

      const filtered = allCustomers.filter(c =>
        c.name.toLowerCase().includes(term.toLowerCase()) ||
        c.email.toLowerCase().includes(term.toLowerCase())
      );
      
      const limit = 5;
      const totalResults = filtered.length;
      const totalPages = Math.ceil(totalResults / limit);
      const startIndex = (page - 1) * limit;
      const results = filtered.slice(startIndex, startIndex + limit);

      const response: PaginatedResponse<any> = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };

      return of(response).pipe(delay(500));
    }
    
    return of({ results: [], page: 1, limit: 10, totalPages: 0, totalResults: 0 });
  }
}