export type TodoIdType = string;
export interface Todo {
  id: TodoIdType;
  name: string;
  isCompleted: boolean;
}
export interface CompletedTodo extends Todo {
  completionTimestamp: number;
}
