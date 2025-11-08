import { useState } from 'react';
import { useXmlSchemaStore } from '../store/xmlSchemaStore';
import { XmlElement, XmlSchemaType } from '../types/xmlSchema';
import { ChevronDown, ChevronRight, Trash2, Edit, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface XmlElementEditorProps {
  element: XmlElement;
  level: number;
  parentId?: string;
}

const XmlElementEditor = ({ element, level, parentId }: XmlElementEditorProps) => {
  const { updateElement, deleteElement, addElement, moveElement, addAttribute } = useXmlSchemaStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const [editName, setEditName] = useState(element.name);
  const [editType, setEditType] = useState<XmlSchemaType>(element.type);
  const [editRequired, setEditRequired] = useState(element.required);

  const hasChildren = element.children && element.children.length > 0;
  const hasAttributes = element.attributes && element.attributes.length > 0;

  const handleSave = () => {
    if (editName.trim()) {
      updateElement(element.id, {
        name: editName.trim(),
        type: editType,
        required: editRequired,
      });
      setIsEditing(false);
    }
  };

  const handleTypeChange = (newType: XmlSchemaType) => {
    setEditType(newType);
    if (newType === 'element') {
      updateElement(element.id, {
        type: newType,
        children: [],
      });
    } else if (newType === 'text') {
      updateElement(element.id, {
        type: newType,
        textContent: 'text content',
        children: undefined,
      });
    } else {
      updateElement(element.id, {
        type: newType,
        children: undefined,
        textContent: undefined,
      });
    }
  };

  if (isEditing) {
    return (
      <div className={`rounded-lg p-4 ${level > 0 ? 'ml-6' : ''}`} style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '2px solid rgba(6, 182, 212, 0.5)' }}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Element Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={editType}
              onChange={(e) => handleTypeChange(e.target.value as XmlSchemaType)}
              className="input-field"
            >
              <option value="element">Element (with children)</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="text">Text Content</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${element.id}`}
              checked={editRequired}
              onChange={(e) => setEditRequired(e.target.checked)}
              className="rounded"
              style={{ accentColor: '#06b6d4' }}
            />
            <label htmlFor={`required-${element.id}`} className="text-sm text-gray-300">
              Required
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1">
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(element.name);
                setEditType(element.type);
                setEditRequired(element.required);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card border-white/10 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          {(hasChildren || hasAttributes) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-100">&lt;{element.name}&gt;</span>
              {element.required && (
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">Required</span>
              )}
              <span className="text-sm px-2 py-0.5 bg-electric-500/20 text-electric-400 rounded border border-electric-500/30">
                {element.type}
              </span>
              {hasAttributes && (
                <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded border border-teal-500/30">
                  {element.attributes?.length} attr{element.attributes?.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => moveElement(element.id, 'up')}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Move up"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => moveElement(element.id, 'down')}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Move down"
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete element "${element.name}"?`)) {
                  deleteElement(element.id);
                }
              }}
              className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setIsAttributesExpanded(!isAttributesExpanded)}
              className="text-sm font-medium text-gray-300 hover:text-electric-400 flex items-center gap-1 transition-colors"
            >
              {isAttributesExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              Attributes {hasAttributes && `(${element.attributes?.length})`}
            </button>
            <button
              onClick={() => {
                addAttribute(element.id, {
                  name: 'newAttr',
                  type: 'string',
                  required: false,
                });
                setIsAttributesExpanded(true);
              }}
              className="text-xs btn-secondary py-1 px-2 flex items-center gap-1"
            >
              <Plus size={12} />
              Add Attribute
            </button>
          </div>

          {isAttributesExpanded && (
            <div className="ml-4 space-y-2">
              {element.attributes?.map((attr) => (
                <div key={attr.id} className="flex items-center gap-2 p-2 rounded border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm font-medium text-gray-100">{attr.name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-electric-500/20 text-electric-400 rounded border border-electric-500/30">
                    {attr.type}
                  </span>
                  {attr.required && (
                    <span className="text-xs text-red-400">*</span>
                  )}
                  <button
                    onClick={() => {
                      const { updateAttribute, deleteAttribute } = useXmlSchemaStore.getState();
                      if (confirm(`Delete attribute "${attr.name}"?`)) {
                        deleteAttribute(element.id, attr.id);
                      }
                    }}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(!element.attributes || element.attributes.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-2">
                  No attributes yet. Click "Add Attribute" to add one.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nested content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {element.type === 'element' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">Child Elements</span>
                  <button
                    onClick={() => {
                      addElement(element.id, {
                        name: 'newChild',
                        type: 'element',
                        required: false,
                      });
                    }}
                    className="text-xs btn-secondary py-1 px-2 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add Child
                  </button>
                </div>
                <div className="space-y-3">
                  {element.children?.map((childElement) => (
                    <XmlElementEditor
                      key={childElement.id}
                      element={childElement}
                      level={level + 1}
                      parentId={element.id}
                    />
                  ))}
                  {(!element.children || element.children.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      No child elements yet. Click "Add Child" to add one.
                    </p>
                  )}
                </div>
              </div>
            )}

            {element.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Content
                </label>
                <input
                  type="text"
                  value={element.textContent || ''}
                  onChange={(e) => updateElement(element.id, { textContent: e.target.value })}
                  className="input-field"
                  placeholder="Enter text content"
                />
              </div>
            )}
          </div>
        )}

        {!isExpanded && (hasChildren || hasAttributes) && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-electric-400 hover:text-teal-400 transition-colors"
            >
              {hasChildren && element.children
                ? `View ${element.children.length} child elements`
                : hasAttributes && element.attributes
                ? `View ${element.attributes.length} attributes`
                : 'Expand to configure'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default XmlElementEditor;


