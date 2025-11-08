import { useXmlSchemaStore } from '../store/xmlSchemaStore';
import { XmlSchema } from '../types/xmlSchema';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface XmlPreviewProps {
  schema: XmlSchema;
}

const XmlPreview = ({ schema }: XmlPreviewProps) => {
  const { generateExampleXml } = useXmlSchemaStore();
  const [copied, setCopied] = useState(false);

  const xmlString = generateExampleXml(schema.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card border-electric-500/20">
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-1">Generated XML</h3>
          <p className="text-xs text-gray-400">Live XML output</p>
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
        <pre className="text-gray-100 p-5 rounded-xl overflow-x-auto text-sm font-mono border border-white/10 bg-navy-950/80 backdrop-blur-sm">
          <code>{xmlString}</code>
        </pre>
      </div>
    </div>
  );
};

export default XmlPreview;


