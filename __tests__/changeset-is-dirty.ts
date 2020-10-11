import { createChangeset } from "../src/changeset";

describe('changeset.isDirty', () => {
  test('is true after data has been changed, false after assign', async () => {
    const model = { name: 'Joshua' };
    const changeset = createChangeset(model);
    changeset.data.name = 'Eduardo';
    expect(changeset.isDirty).toBe(true);
    changeset.assign();
    expect(changeset.isDirty).toBe(false);
  });

  test('is false again if data are changed back to original state', async () => {
    const model = { name: 'Joshua' };
    const changeset = createChangeset(model);
    changeset.data.name = 'Eduardo';
    expect(changeset.isDirty).toBe(true);
    changeset.data.name = 'Joshua';
    expect(changeset.isDirty).toBe(false);
  });
});
