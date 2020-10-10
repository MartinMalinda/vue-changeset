
import { Ref } from 'vue';
import { createChangeset, Change } from '../src/changeset';

describe('changeset', () => {
  test('has proper data after creation', async () => {
    const changeset = createChangeset({ name: 'Alexander' });
    expect(changeset.data).toStrictEqual({ name: 'Alexander' });
  });

  test('has proper change object after creation', async () => {
    const changeset = createChangeset({ name: 'Alexander' });
    const nameChange : Change = {
      oldValue: 'Alexander',
      newValue: 'Alexander',
      isDirty: (false as unknown) as Ref<boolean>,
      error: false,
      isValidating: false
    };
    expect(changeset.change).toStrictEqual({ name: nameChange });
  });

  test('does not changes model via mutation of changeset data', async () => {
    const model = { name: 'Alexander' };
    const changeset = createChangeset(model);
    changeset.data.name = 'Rudolph';
    expect(model).toStrictEqual({ name: 'Alexander' });
  });

  test('has isDirty false in the beginning', async () => {
    const model = { name: 'Alexander' };
    const changeset = createChangeset(model);
    expect(changeset.isDirty).toBe(false);
  });

  test('has isValid true in the beginning', async () => {
    const model = { name: 'Alexander' };
    const changeset = createChangeset(model);
    expect(changeset.isValid).toBe(true);
  });
});
