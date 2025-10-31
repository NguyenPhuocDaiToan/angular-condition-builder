import { ChangeDetectionStrategy, Component, model, output, input } from '@angular/core';
import { Condition, ConditionGroup, Field, LogicalOperator, RuleBuilderConfig } from '../../models/rule-builder.model';
import { ConditionRowComponent } from '../condition-row/condition-row.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-condition-group',
  templateUrl: './condition-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, ConditionRowComponent, ConditionGroupComponent],
})
export class ConditionGroupComponent {
  group = model.required<ConditionGroup>();
  config = input.required<RuleBuilderConfig>();
  isRoot = input<boolean>(false);
  submitted = input<boolean>(false);
  remove = output<void>();

  isCondition(item: Condition | ConditionGroup): item is Condition {
    return 'fieldId' in item;
  }

  isGroup(item: Condition | ConditionGroup): item is ConditionGroup {
    return 'conditions' in item;
  }

  updateLogicalOperator(operator: LogicalOperator) {
    this.group.update(g => ({...g, operator}));
  }

  private createNewCondition(): Condition {
    const fields = this.config().fields;
    if (fields.length === 0) {
      throw new Error("Cannot create a condition without any fields defined in the config.");
    }
    return {
      id: crypto.randomUUID(),
      fieldId: fields[0].id,
      operator: fields[0].operators[0],
      value: null
    };
  }

  addCondition() {
    this.addConditionAt(this.group().conditions.length);
  }

  addConditionAt(index: number) {
    const newCondition = this.createNewCondition();
    this.group.update(g => {
      const newConditions = [...g.conditions];
      newConditions.splice(index, 0, newCondition);
      return {...g, conditions: newConditions};
    });
  }

  addGroup() {
    const newGroup: ConditionGroup = {
      id: crypto.randomUUID(),
      operator: 'AND',
      conditions: []
    };
    this.group.update(g => ({...g, conditions: [...g.conditions, newGroup]}));
  }

  updateCondition(index: number, updatedCondition: Condition) {
    this.group.update(g => {
      const newConditions = [...g.conditions];
      newConditions[index] = updatedCondition;
      return {...g, conditions: newConditions};
    });
  }

  updateSubGroup(index: number, updatedGroup: ConditionGroup) {
     this.group.update(g => {
      const newConditions = [...g.conditions];
      newConditions[index] = updatedGroup;
      return {...g, conditions: newConditions};
    });
  }

  removeItem(index: number) {
     this.group.update(g => {
      const newConditions = [...g.conditions];
      newConditions.splice(index, 1);
      return {...g, conditions: newConditions};
    });
  }
}
