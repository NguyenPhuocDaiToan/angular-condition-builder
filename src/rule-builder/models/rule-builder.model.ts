import { Observable } from 'rxjs';

export type LogicalOperator = 'AND' | 'OR';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export enum Operator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
}

export interface Condition {
  id: string;
  fieldId: string;
  operator: Operator;
  value: any;
}

export interface ConditionGroup {
  id: string;
  operator: LogicalOperator;
  conditions: (Condition | ConditionGroup)[];
}

export interface FieldSource {
  apiUrl: string;
  valueField: string;
  labelField: string;
}

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  operators: Operator[];
  source?: FieldSource;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export type FetchOptionsFn = (
  source: FieldSource,
  page: number,
  term: string
) => Observable<PaginatedResponse<any>>;

export interface RuleBuilderConfig {
  fields: Field[];
  fetchOptions: FetchOptionsFn;
}
