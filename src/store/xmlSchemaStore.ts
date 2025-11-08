import { create } from 'zustand';
import { XmlSchema, XmlElement, XmlAttribute } from '../types/xmlSchema';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface XmlSchemaStore {
  schemas: XmlSchema[];
  currentSchema: XmlSchema | null;
  history: {
    past: XmlSchema[];
    present: XmlSchema | null;
    future: XmlSchema[];
  };
  
  // Schema management
  createSchema: (name: string, description?: string) => void;
  updateSchema: (id: string, updates: Partial<XmlSchema>) => void;
  deleteSchema: (id: string) => void;
  selectSchema: (id: string | null) => void;
  loadSchemas: () => void;
  saveSchemas: () => void;
  
  // Element management
  addElement: (parentId: string | null, element: Omit<XmlElement, 'id'>) => void;
  updateElement: (elementId: string, updates: Partial<XmlElement>) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (elementId: string, direction: 'up' | 'down') => void;
  
  // Attribute management
  addAttribute: (elementId: string, attribute: Omit<XmlAttribute, 'id'>) => void;
  updateAttribute: (elementId: string, attributeId: string, updates: Partial<XmlAttribute>) => void;
  deleteAttribute: (elementId: string, attributeId: string) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Export/Import
  exportSchema: (schemaId: string) => string;
  importSchema: (schemaJson: string) => void;
  generateExampleXml: (schemaId: string) => string;
}

const STORAGE_KEY = 'xml-schema-builder-schemas';
const HISTORY_LIMIT = 50;

// Helper function to find element by ID recursively
const findElement = (elements: XmlElement[], id: string): { element: XmlElement; parent: XmlElement[] } | null => {
  for (const element of elements) {
    if (element.id === id) {
      return { element, parent: elements };
    }
    if (element.children) {
      const found = findElement(element.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const useXmlSchemaStore = create<XmlSchemaStore>((set, get) => ({
  schemas: [],
  currentSchema: null,
  history: {
    past: [],
    present: null,
    future: [],
  },

  loadSchemas: () => {
    const saved = loadFromLocalStorage<XmlSchema[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      set({ schemas: saved });
    }
  },

  saveSchemas: () => {
    const { schemas } = get();
    saveToLocalStorage(STORAGE_KEY, schemas);
  },

  createSchema: (name, description) => {
    const newSchema: XmlSchema = {
      id: generateId(),
      name,
      description,
      rootElement: 'root',
      elements: [],
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

  addElement: (parentId, element) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newElement: XmlElement = {
      ...element,
      id: generateId(),
    };

    let updatedSchema: XmlSchema;

    if (parentId === null) {
      // Add to root
      updatedSchema = {
        ...currentSchema,
        elements: [...currentSchema.elements, newElement],
        updatedAt: Date.now(),
      };
    } else {
      // Find parent and add to it
      const updatedElements = [...currentSchema.elements];
      const updateNested = (elements: XmlElement[]): XmlElement[] => {
        return elements.map((el) => {
          if (el.id === parentId) {
            return { ...el, children: [...(el.children || []), newElement] };
          }
          const result: XmlElement = { ...el };
          if (el.children) {
            result.children = updateNested(el.children);
          }
          return result;
        });
      };

      updatedSchema = {
        ...currentSchema,
        elements: updateNested(updatedElements),
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

  updateElement: (elementId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updateNested = (elements: XmlElement[]): XmlElement[] => {
      return elements.map((element) => {
        if (element.id === elementId) {
          const updated = { ...element, ...updates };
          // Reset children when changing type
          if (updates.type && updates.type !== element.type) {
            if (updates.type !== 'element') {
              updated.children = undefined;
            } else {
              updated.children = [];
            }
          }
          return updated;
        }
        const result: XmlElement = { ...element };
        if (element.children) {
          result.children = updateNested(element.children);
        }
        return result;
      });
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: updateNested(currentSchema.elements),
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

  deleteElement: (elementId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const deleteNested = (elements: XmlElement[]): XmlElement[] => {
      return elements
        .filter((el) => el.id !== elementId)
        .map((element) => {
          const result: XmlElement = { ...element };
          if (element.children) {
            result.children = deleteNested(element.children);
          }
          return result;
        });
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: deleteNested(currentSchema.elements),
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

  moveElement: (elementId, direction) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const moveNested = (elements: XmlElement[]): XmlElement[] => {
      const index = elements.findIndex((el) => el.id === elementId);
      if (index === -1) {
        return elements.map((element) => {
          const result: XmlElement = { ...element };
          if (element.children) {
            result.children = moveNested(element.children);
          }
          return result;
        });
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= elements.length) return elements;

      const newElements = [...elements];
      [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
      return newElements;
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: moveNested(currentSchema.elements),
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

  addAttribute: (elementId, attribute) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const newAttribute: XmlAttribute = {
      ...attribute,
      id: generateId(),
    };

    const updateNested = (elements: XmlElement[]): XmlElement[] => {
      return elements.map((element) => {
        if (element.id === elementId) {
          return {
            ...element,
            attributes: [...(element.attributes || []), newAttribute],
          };
        }
        const result: XmlElement = { ...element };
        if (element.children) {
          result.children = updateNested(element.children);
        }
        return result;
      });
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: updateNested(currentSchema.elements),
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

  updateAttribute: (elementId, attributeId, updates) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updateNested = (elements: XmlElement[]): XmlElement[] => {
      return elements.map((element) => {
        if (element.id === elementId) {
          return {
            ...element,
            attributes: element.attributes?.map((attr) =>
              attr.id === attributeId ? { ...attr, ...updates } : attr
            ),
          };
        }
        const result: XmlElement = { ...element };
        if (element.children) {
          result.children = updateNested(element.children);
        }
        return result;
      });
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: updateNested(currentSchema.elements),
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

  deleteAttribute: (elementId, attributeId) => {
    const { currentSchema } = get();
    if (!currentSchema) return;

    const updateNested = (elements: XmlElement[]): XmlElement[] => {
      return elements.map((element) => {
        if (element.id === elementId) {
          return {
            ...element,
            attributes: element.attributes?.filter((attr) => attr.id !== attributeId),
          };
        }
        const result: XmlElement = { ...element };
        if (element.children) {
          result.children = updateNested(element.children);
        }
        return result;
      });
    };

    const updatedSchema: XmlSchema = {
      ...currentSchema,
      elements: updateNested(currentSchema.elements),
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
      const schema: XmlSchema = JSON.parse(schemaJson);
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

  generateExampleXml: (schemaId) => {
    const schema = get().schemas.find((s) => s.id === schemaId);
    if (!schema) return '';

    const generateFromElement = (element: XmlElement, indent: number = 0): string => {
      const indentStr = '  '.repeat(indent);
      const attrs = element.attributes?.map((attr) => {
        const value = attr.defaultValue !== undefined 
          ? String(attr.defaultValue) 
          : attr.type === 'string' ? 'value' : attr.type === 'number' ? '0' : 'true';
        return `${attr.name}="${value}"`;
      }).join(' ') || '';

      const attrsStr = attrs ? ` ${attrs}` : '';

      if (element.type === 'text') {
        const text = element.textContent || 'text content';
        return `${indentStr}<${element.name}${attrsStr}>${text}</${element.name}>`;
      }

      if (element.children && element.children.length > 0) {
        const childrenXml = element.children
          .map((child) => generateFromElement(child, indent + 1))
          .join('\n');
        return `${indentStr}<${element.name}${attrsStr}>\n${childrenXml}\n${indentStr}</${element.name}>`;
      }

      // Self-closing or empty element
      return `${indentStr}<${element.name}${attrsStr} />`;
    };

    const rootName = schema.rootElement || 'root';
    const namespaceDecl = schema.namespace 
      ? ` xmlns${schema.namespacePrefix ? `:${schema.namespacePrefix}` : ''}="${schema.namespace}"`
      : '';

    const elementsXml = schema.elements
      .map((el) => generateFromElement(el, 1))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}${namespaceDecl}>\n${elementsXml}\n</${rootName}>`;
  },
}));


