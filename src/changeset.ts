import { computed, reactive, Ref, watch, WatchStopHandle } from 'vue';
import defaultOptions from './default-options';

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


export type BaseModel = Record<any, any>;
type ValidationError = boolean | string;
export type ValidateFn<T> = (prop? : keyof T, value?) => ValidationError | Promise<ValidationError>;

export interface ChangesetOptions<T> {
  autoValidate: boolean;
  validate: ValidateFn<T>;
  copy: (obj: BaseModel) => BaseModel;
  checkifDirty: (change: { key: keyof T, oldValue: any, newValue: any, changeset: Changeset<T> }) => boolean;
};

export type Change = {
  oldValue: any;
  newValue: any;
  isDirty: Ref<boolean>;
  error: ValidationError;
  isValidating: boolean;
};

type ChangeMap<T> = Record<keyof T, Change>;

export type Changeset<T> = {
  _model: T,
  _stopHandles: WatchStopHandle[],

  data: T,
  change: ChangeMap<T>,
  isValid: Ref<boolean>,
  isDirty: Ref<boolean>,
  isValidating: Ref<boolean>,
  validate: ValidateFn<T>,
  assign: () => void,
  assignIfValid: () => Promise<boolean>,
};

function createChangeMap<T>(model : T, getChangeset : () => Changeset<T>, options: ChangesetOptions<T>) : ChangeMap<T> {
  const changeMap : any = {};

  Object.keys(model).forEach(key => {
    changeMap[key] = {
      oldValue: model[key],
      newValue: computed(() => {
        const changeset = getChangeset();
        return changeset.data[key];
      }),
      isDirty: computed(() => {
        // TODO: abstract and improve
        const changeset = getChangeset();
        const newValue = changeset.change[key].newValue;
        const oldValue = changeset.change[key].oldValue;
        return options.checkifDirty({ newValue, oldValue, changeset, key: key as keyof T });
      }),
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
    _stopHandles: [],

    data: _options.copy(model),
    change: createChangeMap(model, () => changeset, _options),
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
      const validationResult = await _options.validate(prop, value);
      changeset.change[prop].error = typeof validationResult === 'string' ? validationResult : !validationResult;
      changeset.change[prop].isValidating = false;
      return changeset.change[prop].error;
    },
    assign() {
      Object.assign(model, changeset.data);
      changeset.data = _options.copy(model);
      changeset.change = createChangeMap(model, () => changeset, _options);
    },
    async assignIfValid() {
      await changeset.validate();
      if (changeset.isValid) {
        changeset.assign();
      }

      return changeset.isValid;
    }
  });

  if (_options.autoValidate) {
    const stopHandles = Object.keys(model).map((key) => {
      return watch(() => changeset.data[key], () => changeset.validate(key));
    });

    changeset._stopHandles = [...changeset._stopHandles, ...stopHandles];
  }

  return changeset;
}
