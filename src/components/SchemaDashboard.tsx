import { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { Database, Plus, FileDown, FileUp, Trash2, Edit, Download } from 'lucide-react';
import { downloadJSON, readFileAsText, validateSchema } from '../utils/helpers';

const SchemaDashboard = () => {
  const { schemas, createSchema, selectSchema, deleteSchema, exportSchema, importSchema } = useSchemaStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDesc, setNewSchemaDesc] = useState('');

  const handleCreateSchema = () => {
    if (newSchemaName.trim()) {
      createSchema(newSchemaName.trim(), newSchemaDesc.trim() || undefined);
      setNewSchemaName('');
      setNewSchemaDesc('');
      setShowCreateModal(false);
    }
  };

  const handleExport = (schemaId: string) => {
    const json = exportSchema(schemaId);
    const schema = schemas.find((s) => s.id === schemaId);
    const filename = `${schema?.name || 'schema'}-${Date.now()}.json`;
    downloadJSON(json, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const validation = validateSchema(JSON.parse(content));
      
      if (!validation.valid) {
        alert(`Invalid schema file:\n${validation.errors.join('\n')}`);
        return;
      }

      importSchema(content);
      alert('Schema imported successfully!');
    } catch (error) {
      alert('Failed to import schema. Please check the file format.');
      console.error(error);
    }
    
    event.target.value = '';
  };

  const handleExportAll = () => {
    const allSchemas = {
      schemas,
      exportedAt: new Date().toISOString(),
    };
    downloadJSON(JSON.stringify(allSchemas, null, 2), `all-schemas-${Date.now()}.json`);
  };

  return (
    <div className="min-h-screen" style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ padding: '80px 24px' }}>
        <div className="absolute inset-0 hero-gradient opacity-50 blur-3xl"></div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <div className="inline-flex items-center justify-center" style={{ padding: '16px', background: 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(20, 184, 166, 0.2))', borderRadius: '24px', marginBottom: '32px', backdropFilter: 'blur(12px)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <Database size={48} className="text-electric-400" />
            </div>
            <h1 className="font-bold text-gradient" style={{ fontSize: '64px', marginBottom: '24px', lineHeight: '1.2' }}>
              Schema Designer
            </h1>
            <p className="text-gray-300" style={{ fontSize: '20px', maxWidth: '672px', margin: '0 auto 40px', lineHeight: '1.6' }}>
              Design and manage your data schemas visually with entities, relationships, and complex nested structures.
            </p>
            <div className="flex items-center justify-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center gap-2"
                style={{ fontSize: '18px', padding: '16px 32px' }}
              >
                <Plus size={20} />
                Create New Schema
              </button>
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2" style={{ fontSize: '18px', padding: '16px 32px' }}>
                <FileUp size={20} />
                Import Schema
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
            <div className="card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-electric-500/30">
                <Database size={32} className="text-electric-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Visual Design</h3>
              <p className="text-gray-400">Drag and drop entities to create your schema visually</p>
            </div>
            <div className="card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-electric-500/30">
                <Database size={32} className="text-electric-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Relationships</h3>
              <p className="text-gray-400">Define complex relationships between entities</p>
            </div>
            <div className="card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-electric-500/30">
                <Database size={32} className="text-electric-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">Export & Import</h3>
              <p className="text-gray-400">Save and share your schemas as JSON files</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schema Grid */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {schemas.length === 0 ? (
            <div className="card text-center" style={{ padding: '80px 24px' }}>
              <div className="flex items-center justify-center" style={{ padding: '24px', borderRadius: '50%', width: '96px', height: '96px', margin: '0 auto 24px', background: 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(20, 184, 166, 0.2))', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <Database size={48} className="text-electric-400" />
              </div>
              <h2 className="font-semibold text-gray-100" style={{ fontSize: '30px', marginBottom: '12px' }}>No schemas yet</h2>
              <p className="text-gray-400" style={{ fontSize: '18px', marginBottom: '32px' }}>Create your first schema to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Schema
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h2 className="font-bold text-gray-100" style={{ fontSize: '30px', marginBottom: '8px' }}>Your Schemas</h2>
                <p className="text-gray-400" style={{ fontSize: '16px' }}>Manage and edit your schema collection</p>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {schemas.map((schema) => (
                  <div key={schema.id} className="card-hover group" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex items-start justify-between" style={{ marginBottom: '20px', flex: 1 }}>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100 group-hover:text-electric-400 transition-colors" style={{ fontSize: '20px', marginBottom: '8px' }}>
                          {schema.name}
                        </h3>
                        {schema.description && (
                          <p className="text-gray-400" style={{ fontSize: '14px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{schema.description}</p>
                        )}
                        <div className="flex items-center" style={{ gap: '12px', fontSize: '14px' }}>
                          <span className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300" style={{ padding: '6px 12px' }}>
                            {schema.entities.length} entities
                          </span>
                          <span className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300" style={{ padding: '6px 12px' }}>
                            {schema.relationships.length} relationships
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex" style={{ gap: '8px', marginTop: '16px' }}>
                      <button
                        onClick={() => selectSchema(schema.id)}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleExport(schema.id)}
                        className="btn-secondary flex items-center justify-center gap-2 px-3"
                        title="Export"
                      >
                        <FileDown size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${schema.name}"? This action cannot be undone.`)) {
                            deleteSchema(schema.id);
                          }
                        }}
                        className="btn-danger flex items-center justify-center gap-2 px-3"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="card border-electric-500/30 shadow-2xl" style={{ maxWidth: '448px', width: '100%' }}>
            <h2 className="font-bold text-gray-100" style={{ fontSize: '30px', marginBottom: '24px' }}>Create New Schema</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="block text-gray-300" style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Schema Name *
                </label>
                <input
                  type="text"
                  value={newSchemaName}
                  onChange={(e) => setNewSchemaName(e.target.value)}
                  placeholder="e.g., E-commerce System"
                  className="input-field"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSchema();
                    if (e.key === 'Escape') setShowCreateModal(false);
                  }}
                />
              </div>
              <div>
                <label className="block text-gray-300" style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newSchemaDesc}
                  onChange={(e) => setNewSchemaDesc(e.target.value)}
                  placeholder="Brief description of your schema"
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex" style={{ gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSchemaName('');
                    setNewSchemaDesc('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSchema}
                  disabled={!newSchemaName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaDashboard;
