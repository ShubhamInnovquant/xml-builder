export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const downloadJSON = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const validateSchema = (schema: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!schema.name || typeof schema.name !== 'string') {
    errors.push('Schema must have a valid name');
  }

  if (!Array.isArray(schema.entities)) {
    errors.push('Schema must have an entities array');
  }

  if (!Array.isArray(schema.relationships)) {
    errors.push('Schema must have a relationships array');
  }

  schema.entities?.forEach((entity: any, index: number) => {
    if (!entity.name || typeof entity.name !== 'string') {
      errors.push(`Entity ${index + 1} must have a valid name`);
    }
    if (!Array.isArray(entity.fields)) {
      errors.push(`Entity ${index + 1} must have a fields array`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};


