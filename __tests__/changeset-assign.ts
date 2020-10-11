import { createChangeset } from "../src/changeset";
import { waitFor } from '@testing-library/dom';

describe('changeset.assign()', () => {
  test('assigns data from the changeset to the underlying model', async () => {
    const model = { name: 'Joshua' };
    const changeset = createChangeset(model);
    changeset.data.name = 'Eduardo';
    await waitFor(() => !changeset.isValidating);
    expect(changeset.data.name).toBe('Eduardo');
    expect(model.name).toBe('Joshua');
    changeset.assign();
    expect(model.name).toBe('Eduardo');
  });
});
