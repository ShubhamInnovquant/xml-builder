import { useSchemaStore } from '../store/schemaStore';
import { Plus, Trash2 } from 'lucide-react';
import FieldItem from './FieldItem';
import { useState } from 'react';
import { DataType } from '../types/schema';

interface FieldListProps {
  entityId: string;
  fields: any[];
}

const FieldList = ({ entityId, fields }: FieldListProps) => {
  const { addField } = useSchemaStore();
  const [showAddField, setShowAddField] = useState(false);

  const handleAddField = (name: string, type: DataType, required: boolean, additionalData?: any) => {
    addField(entityId, {
      name,
      type,
      required,
      ...(additionalData || {}),
    });
    setShowAddField(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase">Fields</span>
        {!showAddField && (
          <button
            onClick={() => setShowAddField(true)}
            className="p-1 hover:bg-gray-800/60 rounded text-gray-300 hover:text-white transition-colors"
            title="Add field"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {fields.map((field) => (
          <FieldItem key={field.id} entityId={entityId} field={field} />
        ))}

        {showAddField && (
          <AddFieldForm
            onSave={handleAddField}
            onCancel={() => setShowAddField(false)}
          />
        )}

        {fields.length === 0 && !showAddField && (
          <p className="text-sm text-gray-400 text-center py-2">
            No fields yet. Click + to add one.
          </p>
        )}
      </div>
    </div>
  );
};

interface AddFieldFormProps {
  onSave: (name: string, type: DataType, required: boolean, additionalData?: any) => void;
  onCancel: () => void;
}

const AddFieldForm = ({ onSave, onCancel }: AddFieldFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<DataType>('string');
  const [required, setRequired] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const fieldData: any = {
        name: name.trim(),
        type,
        required,
      };
      
      // Initialize nested structures for complex types
      if (type === 'object') {
        fieldData.nestedFields = [];
      } else if (type === 'array') {
        fieldData.arrayItemType = { type: 'primitive', value: 'string' };
      }
      
      onSave(fieldData.name, fieldData.type, fieldData.required, fieldData);
      setName('');
      setType('string');
      setRequired(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 rounded border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Field name"
        className="input-field text-sm mb-2"
        autoFocus
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as DataType)}
        className="input-field text-sm mb-2"
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="date">Date</option>
        <option value="object">Object</option>
        <option value="array">Array</option>
        <option value="null">Null</option>
        <option value="undefined">Undefined</option>
      </select>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="required" className="text-xs text-gray-300">
          Required
        </label>
      </div>
      <div className="flex gap-1">
        <button
          type="submit"
          className="flex-1 btn-primary text-xs py-1"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary text-xs py-1 px-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FieldList;

