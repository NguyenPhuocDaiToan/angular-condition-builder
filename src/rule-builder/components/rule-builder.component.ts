import { ChangeDetectionStrategy, Component, forwardRef, input, signal, effect, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Condition, ConditionGroup, Operator, RuleBuilderConfig } from '../models/rule-builder.model';
import { ConditionGroupComponent } from './condition-group/condition-group.component';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-rule-builder',
  templateUrl: './rule-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ConditionGroupComponent, JsonPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RuleBuilderComponent),
      multi: true,
    },
  ],
})
export class RuleBuilderComponent implements ControlValueAccessor {
  config = input.required<RuleBuilderConfig>();
  title = input<string>();
  description = input<string>();
  
  // This output is for consumers who prefer event binding over ngModel.
  ruleChange = output<ConditionGroup>();

  rootGroup = signal<ConditionGroup>({
    id: 'root',
    operator: 'AND',
    conditions: [],
  });

  showOutput = signal(false);
  submitted = signal(false);

  // ControlValueAccessor implementation
  private onChange: (value: ConditionGroup) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // When the internal state changes, propagate it to the outside world.
    effect(() => {
      const currentGroup = this.rootGroup();
      this.onChange(currentGroup);
      this.ruleChange.emit(currentGroup);
    });
  }

  writeValue(value: ConditionGroup): void {
    if (value) {
      this.rootGroup.set(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private validateCondition(condition: Condition): boolean {
    const isUnaryOperator = condition.operator === Operator.IS_EMPTY || condition.operator === Operator.IS_NOT_EMPTY;
    if (isUnaryOperator) return true;
    const value = condition.value;
    return value !== null && value !== undefined && value !== '';
  }

  private validateGroup(group: ConditionGroup): boolean {
    return group.conditions.every(item => {
      if ('fieldId' in item) {
        return this.validateCondition(item as Condition);
      } else if ('conditions' in item) {
        return this.validateGroup(item as ConditionGroup);
      }
      return false;
    });
  }

  clearAllRules(): void {
    const initialGroup: ConditionGroup = {
      id: 'root',
      operator: 'AND',
      conditions: [],
    };
    this.rootGroup.set(initialGroup);
    this.showOutput.set(false);
    this.submitted.set(false);
    this.onTouched();
  }

  logState() {
    this.submitted.set(true);
    const isValid = this.validateGroup(this.rootGroup());
    this.showOutput.set(isValid);
    if (isValid) {
      console.log(JSON.stringify(this.rootGroup(), null, 2));
    } else {
      console.log('Validation failed. Please fill all required fields.');
    }
    this.onTouched();
  }
}
