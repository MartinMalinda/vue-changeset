# 🚦 vue-changeset - alpha

[![gzip size](https://img.badgesize.io/https:/unpkg.com/vue-changeset/dist/vue-changeset.modern.js?label=gzip&compression=gzip)](https://unpkg.com/vue-changeset/dist/vue-changeset.modern.js) ![npm](https://img.shields.io/npm/v/vue-changeset)

A tiny change management library. Useful for validation and making sure that unchecked, unvalidated state does not leak / persist into your main data store.

Inspired by [Ecto Changeset](https://hexdocs.pm/ecto/Ecto.Changeset.html) and [ember-changeset](https://github.com/poteto/ember-changeset).

As opposed to [ember-changeset](https://github.com/poteto/ember-changeset) this has just a core tiny feature set and does not support a lot of features like rollbacks, snapshots and nested data handling.

## Features

- [x] Vue 3 support
- [ ] Vue 2 + composition API support
- [x] createChangeset
- [x] useChangeset (createChangeset + cleanup on unmount) 
- [ ] nested data handling
- [x] `changeset.assign()`
- [x] `changeset.assignIfValid()`
- [x] `changeset.validate()`

## Example

vue-changeset tries to not stand in the way and for simple usecases allows you just to pass validation function to rule them all:

```ts
import { defineComponent } from 'vue';
import { useChangeset } from 'vue-changeset';

export default defineComponent({
  setup() {
    const model = { firstName: 'John', lastName: 'Doe',  };
    const userChangeset = useChangeset(model, {
      validate: (prop, value) => {
        if (prop === 'firstName') {
          return value.length > 2 || 'First Name must be at least 2 characters long';
        }

        if (prop === 'lastName') {
          return value.length > 2 || 'Last Name must be at least 2 characters long';
        }
      }
    });

    return { useChangeset };
  }
});
```

```vue
 <form @submit.prevent="changeset.assignIfValid">
    <label>First name</label>
    <input :model="changeset.firstName">
    <span v-if="changeset.changes.firstName.error"> {{ changeset.changes.firstName.error }} </span>
    <button type="submit">Save</button>
 </form>
```

If your validations needs are more advanced, you can use the createValidator function, maybe even together with a separate validation library. I'm using [favalid](https://github.com/akito0107/favalid) in this example.

```ts
import { defineComponent } from 'vue';
import { useChangeset, createValidator } from 'vue-changeset';
// 
import { tester, combine, minLength, regexp } from 'favalid';

export default defineComponent({
  setup() {
    const model = { firstName: 'John', lastName: 'Doe',  };
    const userChangeset = useChangeset(model, {
      validate: createValidator({
        firstName: (value) => value && value.length > 2,
        lastName: combine(
          minLength(3, () => 'too few letters'), 
          regexp(/^[a-zA-Z]+$/, () => 'invalid format', {}),
          tester(() => {
            // some other custom validation here
          }, () => 'Invalid input'))
      })
    });

    return { useChangeset, onSubmit };
  }
});
```

`createChangeset` accepts options as a second argument

```ts
// These are the defaults
const options = {
  autoValidate: false,
  validate: (prop, value) => true,
  copy: obj => ({ ...obj }), // shallow copy
  checkifDirty: ({ key, oldValue, newValue }) => oldValue !== newValue 
};

const changeset = useChangeset(model, options);
```

`autoValidate` will validate a prop on any change
`validate` is a function that is used to validate all data (see examples above)

These functions can be passed to alter the behavior of vue-changeset:
`copy` is used to create a copy of the object, it's a shallow copy by default. You can use deep copy via `JSON.stringify()` and `JSON.parse()` or use a library like [fast-copy](https://github.com/planttheidea/fast-copy) if you need.
`checkIfDirty` is used to handle the `isDirty` flags and is very naive by default, you can pass your own implementation that suits your needs

## Docs

WIP
