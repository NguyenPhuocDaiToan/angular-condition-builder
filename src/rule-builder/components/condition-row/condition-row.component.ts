import { ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal } from '@angular/core';
import { Condition, Field, Operator, PaginatedResponse, RuleBuilderConfig } from '../../models/rule-builder.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-condition-row',
  templateUrl: './condition-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
})
export class ConditionRowComponent {
  condition = model.required<Condition>();
  config = input.required<RuleBuilderConfig>();
  remove = output<void>();
  addAbove = output<void>();
  addBelow = output<void>();
  submitted = input<boolean>(false);
  
  fields = computed(() => this.config().fields);
  
  selectedField = computed<Field | undefined>(() => {
    const fieldId = this.condition().fieldId;
    return this.fields().find(f => f.id === fieldId);
  });
  
  // ng-select state
  options$: Observable<any[]>;
  optionsBuffer: any[] = [];
  typeahead$ = new BehaviorSubject<string>('');
  loading = signal(false);
  isMenuOpen = signal(false);
  
  private currentPage = 1;
  private totalPages = 1;

  // Validation logic
  isValueRequired = computed(() => {
    const operator = this.condition().operator;
    return operator !== Operator.IS_EMPTY && operator !== Operator.IS_NOT_EMPTY;
  });

  isInvalid = computed(() => {
    if (!this.isValueRequired()) {
      return false;
    }
    const value = this.condition().value;
    return value === null || value === undefined || value === '';
  });

  showError = computed(() => this.submitted() && this.isInvalid());

  constructor() {
    effect(() => {
      const field = this.selectedField();
      if (field?.type === 'select' && field.source) {
        this.initializeSelectOptions();
      }
    });

    this.options$ = this.typeahead$.pipe(
        distinctUntilChanged(),
        tap(() => {
            this.optionsBuffer = [];
            this.currentPage = 1;
            this.totalPages = 1;
        }),
        switchMap(term => this.loadOptions(term))
    );
  }

  initializeSelectOptions() {
    this.optionsBuffer = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.typeahead$.next('');
  }

  onFieldChange(fieldId: string): void {
    const newField = this.fields().find(f => f.id === fieldId);
    this.condition.update(c => ({ 
        ...c, 
        fieldId: fieldId, 
        operator: newField?.operators[0] || Operator.EQUALS, 
        value: null 
    }));
  }

  onOperatorChange(operator: Operator): void {
    const isUnary = operator === Operator.IS_EMPTY || operator === Operator.IS_NOT_EMPTY;
    this.condition.update(c => ({ ...c, operator: operator, value: isUnary ? null : c.value }));
  }

  onValueChange(value: any): void {
    this.condition.update(c => ({ ...c, value: value }));
  }

  onScrollToEnd(): void {
    if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadMoreOptions();
    }
  }

  onAddAbove() {
    this.addAbove.emit();
    this.isMenuOpen.set(false);
  }

  onAddBelow() {
    this.addBelow.emit();
    this.isMenuOpen.set(false);
  }

  onRemove() {
    this.remove.emit();
    this.isMenuOpen.set(false);
  }

  private loadMoreOptions(): void {
    const term = this.typeahead$.getValue();
    this.loading.set(true);
    this.loadOptions(term, this.currentPage).pipe(
        tap(() => this.loading.set(false))
    ).subscribe(newOptions => {
        this.optionsBuffer = [...this.optionsBuffer, ...newOptions];
    });
  }

  private loadOptions(term: string, page: number = 1): Observable<any[]> {
    const field = this.selectedField();
    if (field?.type !== 'select' || !field.source) {
        return of([]);
    }
    
    this.loading.set(true);
    // Use the provided fetch function from the config
    return this.config().fetchOptions(field.source, page, term).pipe(
        tap((res: PaginatedResponse<any>) => {
            this.totalPages = res.totalPages;
            this.optionsBuffer = page === 1 ? res.results : [...this.optionsBuffer, ...res.results];
            this.loading.set(false);
        }),
        map(() => this.optionsBuffer)
    );
  }

  get operatorNameMapping(): Record<Operator, string> {
    return {
      [Operator.EQUALS]: 'Equals',
      [Operator.NOT_EQUALS]: 'Not Equals',
      [Operator.CONTAINS]: 'Contains',
      [Operator.DOES_NOT_CONTAIN]: 'Does Not Contain',
      [Operator.GREATER_THAN]: 'Greater Than',
      [Operator.LESS_THAN]: 'Less Than',
      [Operator.IS_EMPTY]: 'Is Empty',
      [Operator.IS_NOT_EMPTY]: 'Is Not Empty'
    };
  }
}
