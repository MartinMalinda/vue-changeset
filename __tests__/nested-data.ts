import { createChangeset, Changeset } from '../src/changeset';
import { watch } from 'vue';

describe('changeset with nested data', () => {
  // SKIPPED - not implemented so far
  test.skip('validation function is called if nested data change', () => {
    const validate = jest.fn().mockImplementation(console.log);
    const changeset = createChangeset({
      name: 'Leonard',
      settings: {
        sendNotifications: true
      }
    }, {
      validate
    });

    changeset.data.settings.sendNotifications = false;
    expect(validate).toHaveBeenCalled();
  });

  test('isDirty is false in the beginning for nested data', () => {
    const validate = jest.fn().mockImplementation(console.log);
    const changeset = createChangeset({
      name: 'Leonard',
      settings: {
        sendNotifications: true
      }
    }, {
      validate
    });

    expect(changeset.isDirty).toBe(false);
  });

  // SKIPPED - not implemented so far
  test.skip('isDirty is true if nested data change', () => {
    const validate = jest.fn().mockImplementation(console.log);
    const changeset = createChangeset({
      name: 'Leonard',
      settings: {
        sendNotifications: true
      }
    }, {
      validate
    });

    changeset.data.settings.sendNotifications = false;
    expect(changeset.isDirty).toBe(true);
  }); 
});
