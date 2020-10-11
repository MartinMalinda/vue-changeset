import { createChangeset } from "../src/changeset";
import { waitFor } from '@testing-library/dom';

describe('changeset.assignIfValid()', () => {
  test('assigns data from the changeset to the underlying model if the data are valid', async () => {
    const model = { name: 'Joshua' };
    const changeset = createChangeset(model, {
      validate: (key, value) => !!(value && value.length > 2)
    });
    changeset.data.name = 'H';
    await changeset.assignIfValid();
    expect(model.name).toBe('Joshua');
    expect(changeset.isValid).toBe(false);
    changeset.data.name = 'Hector';
    await changeset.assignIfValid();
    expect(model.name).toBe('Hector');
    expect(changeset.isValid).toBe(true);
  });
});
