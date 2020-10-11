import { onUnmounted } from 'vue';
import { BaseModel, ChangesetOptions, createChangeset, Changeset } from './changeset';

export function destroyChangeset(changeset: Changeset<any>) {
  changeset._stopHandles.forEach(stopHandle => stopHandle());
  delete changeset.data;
  delete changeset._model;
  delete (changeset as any)._stopHandles;
}

export default function useChangeset<T extends BaseModel>(model: T, options? : Partial<ChangesetOptions<T>>) {
  const changeset = createChangeset(model, options);
  onUnmounted(() => destroyChangeset(changeset));
  return changeset;
}
