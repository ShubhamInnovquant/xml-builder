import { create } from 'zustand';
import { JsonSchema, JsonSchemaField } from '../types/jsonSchema';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface JsonSchemaStore {
  schemas: JsonSchema[];
  currentSchema: JsonSchema | null;
  history: {
    past: JsonSchema[];
    present: JsonSchema | null;
    future: JsonSchema[];
  };
  
  // Schema management
  createSchema: (name: string, description?: string) => void;
  updateSchema: (id: string, updates: Partial<JsonSchema>) => void;
  deleteSchema: (id: string) => void;
  selectSchema: (id: string | null) => void;
  loadSchemas: () => void;
  saveSchemas: () => void;
  
  // Field management
  addField: (parentId: string | null, field: Omit<JsonSchemaField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<JsonSchemaField>) => void;
  deleteField: (fieldId: string) => void;
  moveField: (fieldId: string, direction: 'up' | 'down') => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Export/Import
  exportSchema: (schemaId: string) => string;
  importSchema: (schemaJson: string) => void;
  generateExampleData: (schemaId: string) => any;
}

const STORAGE_KEY = 'json-schema-builder-schemas';
const HISTORY_LIMIT = 50;

// Helper function to find field by ID recursively
const findField = (fields: JsonSchemaField[], id: string): { field: JsonSchemaField; parent: JsonSchemaField[] } | null => {
  for (const field of fields) {
    if (field.id === id) {
      return { field, parent: fields };
    }
    if (field.nestedFields) {
      const found = findField(field.nestedFields, id);
      if (found) return found;
    }
    if (field.arrayItemType && Array.isArray(field.arrayItemType)) {
      const found = findField(field.arrayItemType, id);
      if (found) return found;
    }
  }
  return null;
};

export const useJsonSchemaStore = create<JsonSchemaStore>((set, get) => ({
  schemas: [],
  currentSchema: null,
  history: {
    past: [],
    present: null,
    future: [],
  },

  loadSchemas: () => {
    const saved = loadFromLocalStorage<JsonSchema[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      set({ schemas: saved });
    }
  },

  saveSchemas: () => {
    const { schemas } = get();
    saveToLocalStorage(STORAGE_KEY, schemas);
  },

  createSchema: (name, description) => {
    const newSchema: JsonSchema = {
      id: generateId(),
      name,
      description,
      rootType: 'object',
      fields: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set((state) => ({
      schemas: [...state.schemas, newSchema],
      currentSchema: newSchema,
      history: {
        past: [],
        present: newSchema,
        future: [],
      },
    }));
    
    get().saveSchemas();
  },

  updateSchema: (id, updates) => {
    set((state) => {
      const updatedSchemas = state.schemas.map((schema) =>
        schema.id === id
          ? { ...schema, ...updates, updatedAt: Date.now() }
          : schema
      );
      
      const updatedCurrent = state.currentSchema?.id === id
        ? { ...state.currentSchema, ...updates, updatedAt: Date.now() }
        : state.currentSchema;
      
      return {
        schemas: updatedSchemas,
        currentSchema: updatedCurrent,
      };
    });
    
    get().saveSchemas();
    get().saveToHistory();
  },

  deleteSchema: (id) => {
    set((state) => ({
      schemas: state.schemas.filter((s) => s.id !== id),
      currentSchema: state.currentSchema?.id === id ? null : state.currentSchema,
    }));
    
    get().saveSchemas();
  },

  selectSchema: (id) => {
    if (id === null) {
      set({
        currentSchema: null,
        history: {
          past: [],
          present: null,
          future: [],
        },
      });
      return;
    }
    const schema = get().schemas.find((s) => s.id === id);
    if (schema) {
      set({
        currentSchema: schema,
        history: {
          past: [],
          present: schema,
          future: [],
        },
      });
    }
  },

  addField: (parentId, field) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newField: JsonSchemaField = {
      ...field,
      id: generateId(),
    };

    let updatedSchema: JsonSchema;

    if (parentId === null) {
      // Add to root
      updatedSchema = {
        ...currentSchema,
        fields: [...currentSchema.fields, newField],
        updatedAt: Date.now(),
      };
    } else {
      // Find parent and add to it
      const found = findField(currentSchema.fields, parentId);
      if (!found) return;

      const updatedFields = [...currentSchema.fields];
      const updateNested = (fields: JsonSchemaField[]): JsonSchemaField[] => {
        return fields.map((f) => {
          if (f.id === parentId) {
            if (f.type === 'object') {
              return { ...f, nestedFields: [...(f.nestedFields || []), newField] };
            } else if (f.type === 'array' && Array.isArray(f.arrayItemType)) {
              return { ...f, arrayItemType: [...f.arrayItemType, newField] };
            }
          }
          if (f.nestedFields) {
            return { ...f, nestedFields: updateNested(f.nestedFields) };
          }
          if (f.arrayItemType && Array.isArray(f.arrayItemType)) {
            return { ...f, arrayItemType: updateNested(f.arrayItemType) };
          }
          return f;
        });
      };

      updatedSchema = {
        ...currentSchema,
        fields: updateNested(updatedFields),
        updatedAt: Date.now(),
      };
    }

    set((state) => ({
      currentSchema: updatedSchema,
      schemas: state.schemas.map((s) =>
        s.id === currentSchema.id ? updatedSchema : s
      ),
    }));

    get().saveSchemas();
    get().saveToHistory();
  },

  updateField: (fieldId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updateNested = (fields: JsonSchemaField[]): JsonSchemaField[] => {
      return fields.map((field) => {
        if (field.id === fieldId) {
          const updated = { ...field, ...updates };
          // Reset nested structures when changing type
          if (updates.type && updates.type !== field.type) {
            if (updates.type !== 'object' && updates.type !== 'array') {
              updated.nestedFields = undefined;
              updated.arrayItemType = undefined;
            } else if (updates.type === 'object') {
              updated.nestedFields = [];
              updated.arrayItemType = undefined;
            } else if (updates.type === 'array') {
              updated.arrayItemType = 'string';
              updated.nestedFields = undefined;
            }
          }
          return updated;
        }
        const result: JsonSchemaField = { ...field };
        if (field.nestedFields) {
          result.nestedFields = updateNested(field.nestedFields);
        }
        if (field.arrayItemType && Array.isArray(field.arrayItemType)) {
          result.arrayItemType = updateNested(field.arrayItemType);
        }
        return result;
      });
    };

    const updatedSchema: JsonSchema = {
      ...currentSchema,
      fields: updateNested(currentSchema.fields),
      updatedAt: Date.now(),
    };

    set((state) => ({
      currentSchema: updatedSchema,
      schemas: state.schemas.map((s) =>
        s.id === currentSchema.id ? updatedSchema : s
      ),
    }));

    get().saveSchemas();
    get().saveToHistory();
  },

  deleteField: (fieldId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const deleteNested = (fields: JsonSchemaField[]): JsonSchemaField[] => {
      return fields
        .filter((f) => f.id !== fieldId)
        .map((field) => {
          const result: JsonSchemaField = { ...field };
          if (field.nestedFields) {
            result.nestedFields = deleteNested(field.nestedFields);
          }
          if (field.arrayItemType && Array.isArray(field.arrayItemType)) {
            result.arrayItemType = deleteNested(field.arrayItemType);
          }
          return result;
        });
    };

    const updatedSchema: JsonSchema = {
      ...currentSchema,
      fields: deleteNested(currentSchema.fields),
      updatedAt: Date.now(),
    };

    set((state) => ({
      currentSchema: updatedSchema,
      schemas: state.schemas.map((s) =>
        s.id === currentSchema.id ? updatedSchema : s
      ),
    }));

    get().saveSchemas();
    get().saveToHistory();
  },

  moveField: (fieldId, direction) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const moveNested = (fields: JsonSchemaField[]): JsonSchemaField[] => {
      const index = fields.findIndex((f) => f.id === fieldId);
      if (index === -1) {
        return fields.map((field) => {
          const result: JsonSchemaField = { ...field };
          if (field.nestedFields) {
            result.nestedFields = moveNested(field.nestedFields);
          }
          if (field.arrayItemType && Array.isArray(field.arrayItemType)) {
            result.arrayItemType = moveNested(field.arrayItemType);
          }
          return result;
        });
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= fields.length) return fields;

      const newFields = [...fields];
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      return newFields;
    };

    const updatedSchema: JsonSchema = {
      ...currentSchema,
      fields: moveNested(currentSchema.fields),
      updatedAt: Date.now(),
    };

    set((state) => ({
      currentSchema: updatedSchema,
      schemas: state.schemas.map((s) =>
        s.id === currentSchema.id ? updatedSchema : s
      ),
    }));

    get().saveSchemas();
    get().saveToHistory();
  },

  saveToHistory: () => {
    const { currentSchema, history } = get();
    if (!currentSchema) return;

    const newPast = [...history.past, history.present!].slice(-HISTORY_LIMIT);
    
    set({
      history: {
        past: newPast,
        present: currentSchema,
        future: [],
      },
    });
  },

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    const newFuture = [history.present!, ...history.future];

    set({
      currentSchema: previous,
      history: {
        past: newPast,
        present: previous,
        future: newFuture,
      },
    });

    const { schemas } = get();
    set({
      schemas: schemas.map((s) =>
        s.id === previous.id ? previous : s
      ),
    });

    get().saveSchemas();
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newPast = [...history.past, history.present!];
    const newFuture = history.future.slice(1);

    set({
      currentSchema: next,
      history: {
        past: newPast,
        present: next,
        future: newFuture,
      },
    });

    const { schemas } = get();
    set({
      schemas: schemas.map((s) =>
        s.id === next.id ? next : s
      ),
    });

    get().saveSchemas();
  },

  canUndo: () => {
    return get().history.past.length > 0;
  },

  canRedo: () => {
    return get().history.future.length > 0;
  },

  exportSchema: (schemaId) => {
    const schema = get().schemas.find((s) => s.id === schemaId);
    if (!schema) return '';
    return JSON.stringify(schema, null, 2);
  },

  importSchema: (schemaJson) => {
    try {
      const schema: JsonSchema = JSON.parse(schemaJson);
      schema.id = generateId();
      schema.createdAt = Date.now();
      schema.updatedAt = Date.now();
      
      set((state) => ({
        schemas: [...state.schemas, schema],
      }));
      
      get().saveSchemas();
    } catch (error) {
      console.error('Failed to import schema:', error);
      throw new Error('Invalid schema JSON');
    }
  },

  generateExampleData: (schemaId) => {
    const schema = get().schemas.find((s) => s.id === schemaId);
    if (!schema) return null;

    const generateFromField = (field: JsonSchemaField): any => {
      switch (field.type) {
        case 'string':
          // Return actual string type
          return field.defaultValue !== undefined ? String(field.defaultValue) : 'example string';
        case 'number':
          // Return actual number type
          return field.defaultValue !== undefined ? Number(field.defaultValue) : 0;
        case 'boolean':
          // Return actual boolean type
          if (field.defaultValue !== undefined) {
            return typeof field.defaultValue === 'boolean' 
              ? field.defaultValue 
              : field.defaultValue === 'true' || field.defaultValue === true;
          }
          return false;
        case 'null':
          return null;
        case 'object':
          if (field.nestedFields && field.nestedFields.length > 0) {
            const obj: any = {};
            field.nestedFields.forEach((f) => {
              obj[f.key] = generateFromField(f);
            });
            return obj;
          }
          return {};
        case 'array':
          if (typeof field.arrayItemType === 'string') {
            // Primitive array - return proper types
            const examples: any = {
              string: 'item',  // string type
              number: 1,       // number type
              boolean: true,    // boolean type
              null: null,      // null type
            };
            return [examples[field.arrayItemType] || null];
          } else if (Array.isArray(field.arrayItemType) && field.arrayItemType.length > 0) {
            // Array of objects
            const obj: any = {};
            field.arrayItemType.forEach((f) => {
              obj[f.key] = generateFromField(f);
            });
            return [obj];
          }
          return [];
        default:
          return null;
      }
    };

    if (schema.rootType === 'object') {
      const result: any = {};
      schema.fields.forEach((field) => {
        result[field.key] = generateFromField(field);
      });
      return result;
    } else {
      return schema.fields.map((field) => generateFromField(field));
    }
  },
}));

