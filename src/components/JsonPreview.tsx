import { useJsonSchemaStore } from '../store/jsonSchemaStore';
import { JsonSchema, JsonSchemaField } from '../types/jsonSchema';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface JsonPreviewProps {
  schema: JsonSchema;
}

const JsonPreview = ({ schema }: JsonPreviewProps) => {
  const { generateExampleData } = useJsonSchemaStore();
  const [copied, setCopied] = useState(false);

  const generateJsonStructure = (): any => {
    const example = generateExampleData(schema.id);
    return example || {};
  };

  const jsonStructure = generateJsonStructure();
  const jsonString = JSON.stringify(jsonStructure, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate formatted view with types (no values, only types)
  const generateFormattedView = (fields: JsonSchemaField[], indent: number = 0): string[] => {
    const indentStr = '  '.repeat(indent);
    const lines: string[] = [];

    fields.forEach((field, index) => {
      const typeBadge = getTypeDisplay(field);
      const requiredBadge = field.required ? ' <span class="text-red-400 font-bold">*required</span>' : '';
      const comma = index < fields.length - 1 ? '<span class="text-gray-500">,</span>' : '';
      
      if (field.type === 'object' && field.nestedFields && field.nestedFields.length > 0) {
        lines.push(`${indentStr}<span class="text-blue-400">"${field.key}"</span><span class="text-gray-500">:</span> <span class="text-purple-400 font-semibold">${typeBadge}</span>${requiredBadge} <span class="text-gray-500">{</span>`);
        lines.push(...generateFormattedView(field.nestedFields, indent + 1));
        lines.push(`${indentStr}<span class="text-gray-500">}</span>${comma}`);
      } else if (field.type === 'array') {
        const arrayType = getArrayTypeDisplay(field);
        lines.push(`${indentStr}<span class="text-blue-400">"${field.key}"</span><span class="text-gray-500">:</span> <span class="text-purple-400 font-semibold">${typeBadge}&lt;${arrayType}&gt;</span>${requiredBadge} <span class="text-gray-500">[</span>`);
        if (Array.isArray(field.arrayItemType) && field.arrayItemType.length > 0) {
          lines.push(`${indentStr}  <span class="text-gray-500">{</span>`);
          lines.push(...generateFormattedView(field.arrayItemType, indent + 2));
          lines.push(`${indentStr}  <span class="text-gray-500">}</span>`);
        }
        lines.push(`${indentStr}<span class="text-gray-500">]</span>${comma}`);
      } else {
        // Only show type, no value
        lines.push(`${indentStr}<span class="text-blue-400">"${field.key}"</span><span class="text-gray-500">:</span> <span class="text-purple-400 font-semibold">${typeBadge}</span>${requiredBadge}${comma}`);
      }
    });

    return lines;
  };

  const getTypeDisplay = (field: JsonSchemaField): string => {
    return field.type;
  };

  const getArrayTypeDisplay = (field: JsonSchemaField): string => {
    if (typeof field.arrayItemType === 'string') {
      return field.arrayItemType;
    } else if (Array.isArray(field.arrayItemType)) {
      return 'object';
    }
    return 'unknown';
  };


  const formattedView = generateFormattedView(schema.fields);

  return (
    <div className="space-y-6">
      {/* JSON View */}
      <div className="card border-electric-500/20">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-1">Actual JSON</h3>
            <p className="text-xs text-gray-400">Raw JSON output</p>
          </div>
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="p-5">
          <pre className="text-gray-100 p-5 rounded-xl overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto border border-white/10 bg-navy-950/80 backdrop-blur-sm">
            <code>{jsonString}</code>
          </pre>
        </div>
      </div>

      {/* Formatted View with Types */}
      <div className="card border-electric-500/20">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-xl font-bold text-gray-100 mb-1">Formatted View with Types</h3>
          <p className="text-xs text-gray-400">Structure showing types next to each key</p>
        </div>
        <div className="p-5">
          <div className="text-gray-100 p-5 rounded-xl overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto border border-white/10 bg-navy-950/80 backdrop-blur-sm">
            <div className="space-y-0.5">
              {formattedView.length > 0 ? (
                formattedView.map((line, index) => (
                  <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
                ))
              ) : (
                <div className="text-gray-500">No fields defined yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonPreview;


