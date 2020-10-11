import clone from 'fast-copy';
import { computed, reactive, ref, Ref, watch, toRefs, toRef } from 'vue';

// <IDEA>
// const model = reactive({
//   name: 'foo'
// });

// const refs = toRefs(model);
// Object.entries(refs).forEach(([key, ref]) => {
//   watch(() => ref, () => {
//     // validate ETC
//   });
// });
// </IDEA>

// <IDEA>
// const count = ref(1)
// const plusOne = computed({
//   get: () => count.value + 1,
//   set: val => {
//     count.value = val - 1
//   }
// })
// </IDEA>


type BaseModel = Record<any, any>;
type ValidationError = boolean | string;
type ValidateFn<T> = (prop? : keyof T, value?) => ValidationError | Promise<ValidationError>;

interface ChangesetOptions<T> {
  autoValidate: boolean;
  validate: ValidateFn<T>;
};
const defaultOptions : ChangesetOptions<any> = {
  autoValidate: false,
  validate: (prop, value) => true
};

export type Change = {
  oldValue: any;
  newValue: any;
  isDirty: Ref<boolean>;
  error: ValidationError;
  isValidating: boolean;
};

type ChangeMap<T> = Record<keyof T, Change>;

type Changeset<T> = {
  _model: T,
  data: T,
  change: ChangeMap<T>,
  isValid: Ref<boolean>,
  isDirty: Ref<boolean>,
  isValidating: Ref<boolean>,
  validate: ValidateFn<T>,
  assign: () => void,
};

function createChangeMap<T>(model : T, getChangeset : () => Changeset<T>) : ChangeMap<T> {
  const changeMap : any = {};

  Object.keys(model).forEach(key => {
    changeMap[key] = {
      oldValue: model[key],
      newValue: model[key],
      isDirty: computed(() => {
        const changeset = getChangeset();
        return changeset.change[key].oldValue !== changeset.change[key].newValue;
      }), // TODO: abstract and improve
      error: false,
      isValidating: false,
    };
  });

  return changeMap;
}

export function createChangeset<T extends BaseModel>(model: T, options? : Partial<ChangesetOptions<T>>) : Changeset<T> {

  const _options = {
    ...defaultOptions,
    ...options
  };

  const changeset = reactive<Changeset<T>>({
    _model: model,
    data: clone(model),
    change: createChangeMap(model, () => changeset),
    isValid: computed(() => {
      return !Object.values(changeset.change as ChangeMap<T>).find(change => change.error);
    }),
    isDirty: computed(() => {
      return !!Object.values(changeset.change as ChangeMap<T>).find(change => change.isDirty);
    }),
    isValidating: computed(() => {
      return !!Object.values(changeset.change as ChangeMap<T>).find(change => change.isValidating);
    }),
    async validate(prop) {
      if (!prop) {
        // call itself with each props
        const promises = Object.keys(changeset.data).map(key => changeset.validate(key));
        const errors = await Promise.all(promises);
        return errors;
      }

      changeset.change[prop].isValidating = true;
      const value = changeset.data[prop];
      changeset.change[prop].error = await _options.validate(prop, value);
      changeset.change[prop].isValidating = false;
      return changeset.change[prop].error;
    },
    assign() {
      Object.assign(model, changeset.data);
      changeset.data = clone(model);
      changeset.change = createChangeMap(model, () => changeset);
    }
  });

  Object.keys(model).forEach((key) => {
    watch(() => changeset.data[key], (newValue) => {
      if (_options.autoValidate) {
        changeset.validate(key);
      }
    });
  });

  // console.log({ name: name.value });
  // console.log({ data });
  // console.log({ value: data.value });


  return changeset;
}
