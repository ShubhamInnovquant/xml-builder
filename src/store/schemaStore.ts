import { create } from 'zustand';
import { Schema, Entity, Field, Relationship } from '../types/schema';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { createDummyData } from '../utils/dummyData';

interface SchemaStore {
  schemas: Schema[];
  currentSchema: Schema | null;
  history: {
    past: Schema[];
    present: Schema | null;
    future: Schema[];
  };
  
  // Schema management
  createSchema: (name: string, description?: string) => void;
  updateSchema: (id: string, updates: Partial<Schema>) => void;
  deleteSchema: (id: string) => void;
  selectSchema: (id: string | null) => void;
  loadSchemas: () => void;
  saveSchemas: () => void;
  
  // Entity management
  addEntity: (name: string, position?: { x: number; y: number }) => void;
  updateEntity: (entityId: string, updates: Partial<Entity>) => void;
  deleteEntity: (entityId: string) => void;
  updateEntityPosition: (entityId: string, position: { x: number; y: number }) => void;
  
  // Field management
  addField: (entityId: string, field: Omit<Field, 'id'>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (entityId: string, fieldId: string) => void;
  
  // Relationship management
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (relationshipId: string) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Export/Import
  exportSchema: (schemaId: string) => string;
  importSchema: (schemaJson: string) => void;
}

const STORAGE_KEY = 'schema-designer-schemas';
const HISTORY_LIMIT = 50;

export const useSchemaStore = create<SchemaStore>((set, get) => ({
  schemas: [],
  currentSchema: null,
  history: {
    past: [],
    present: null,
    future: [],
  },

  loadSchemas: () => {
    const saved = loadFromLocalStorage<Schema[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      set({ schemas: saved });
    } else {
      // Load dummy data if no schemas exist
      const dummySchemas = createDummyData();
      set({ schemas: dummySchemas });
      saveToLocalStorage(STORAGE_KEY, dummySchemas);
    }
  },

  saveSchemas: () => {
    const { schemas } = get();
    saveToLocalStorage(STORAGE_KEY, schemas);
  },

  createSchema: (name, description) => {
    const newSchema: Schema = {
      id: generateId(),
      name,
      description,
      entities: [],
      relationships: [],
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

  addEntity: (name, position) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newEntity: Entity = {
      id: generateId(),
      name,
      fields: [],
      position: position || { x: 100, y: 100 },
    };

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: [...currentSchema.entities, newEntity],
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

  updateEntity: (entityId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.map((entity) =>
        entity.id === entityId ? { ...entity, ...updates } : entity
      ),
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

  deleteEntity: (entityId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.filter((e) => e.id !== entityId),
      relationships: currentSchema.relationships.filter(
        (r) => r.fromEntityId !== entityId && r.toEntityId !== entityId
      ),
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

  updateEntityPosition: (entityId, position) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.map((entity) =>
        entity.id === entityId ? { ...entity, position } : entity
      ),
      updatedAt: Date.now(),
    };

    set((state) => ({
      currentSchema: updatedSchema,
      schemas: state.schemas.map((s) =>
        s.id === currentSchema.id ? updatedSchema : s
      ),
    }));

    get().saveSchemas();
  },

  addField: (entityId, field) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newField: Field = {
      ...field,
      id: generateId(),
    };

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.map((entity) =>
        entity.id === entityId
          ? { ...entity, fields: [...entity.fields, newField] }
          : entity
      ),
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

  updateField: (entityId, fieldId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.map((entity) =>
        entity.id === entityId
          ? {
              ...entity,
              fields: entity.fields.map((field) =>
                field.id === fieldId ? { ...field, ...updates } : field
              ),
            }
          : entity
      ),
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

  deleteField: (entityId, fieldId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      entities: currentSchema.entities.map((entity) =>
        entity.id === entityId
          ? {
              ...entity,
              fields: entity.fields.filter((f) => f.id !== fieldId),
            }
          : entity
      ),
      relationships: currentSchema.relationships.map((rel) => {
        if (rel.fromFieldId === fieldId || rel.toFieldId === fieldId) {
          return { ...rel, fromFieldId: undefined, toFieldId: undefined };
        }
        return rel;
      }),
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

  addRelationship: (relationship) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newRelationship: Relationship = {
      ...relationship,
      id: generateId(),
    };

    const updatedSchema: Schema = {
      ...currentSchema,
      relationships: [...currentSchema.relationships, newRelationship],
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

  updateRelationship: (relationshipId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      relationships: currentSchema.relationships.map((rel) =>
        rel.id === relationshipId ? { ...rel, ...updates } : rel
      ),
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

  deleteRelationship: (relationshipId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updatedSchema: Schema = {
      ...currentSchema,
      relationships: currentSchema.relationships.filter(
        (r) => r.id !== relationshipId
      ),
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
      const schema: Schema = JSON.parse(schemaJson);
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
}));

