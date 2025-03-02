/**
 * Utilitaires pour la gestion des endpoints et des types de paramètres
 */

// Types de paramètres possibles avec leurs couleurs associées
export const parameterTypes = {
  string: {
    label: "string",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Chaîne de caractères"
  },
  number: {
    label: "number",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Nombre entier ou décimal"
  },
  boolean: {
    label: "boolean",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Valeur booléenne (true/false)"
  },
  date: {
    label: "date",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Date (YYYY-MM-DD)"
  },
  datetime: {
    label: "datetime",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Date et heure (YYYY-MM-DDThh:mm:ss)"
  },
  array: {
    label: "array",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Tableau (séparé par des virgules)"
  },
  object: {
    label: "object",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    description: "Objet JSON"
  },
  id: {
    label: "id",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Identifiant unique"
  },
  path: {
    label: "path",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    description: "Variable de chemin (URL)"
  },
  unknown: {
    label: "unknown",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "Type inconnu"
  }
};

export type ParameterType = keyof typeof parameterTypes;

/**
 * Détermine le type probable d'un paramètre en fonction de son nom
 */
export function detectParameterType(name: string): ParameterType {
  name = name.toLowerCase();
  
  // Si c'est une variable de chemin, retourner path
  if (name.includes('path') || name.includes('route')) {
    return 'path';
  }
  
  // Types basés sur des mots clés communs
  if (name.includes('id') || name === '_id' || name.endsWith('Id')) {
    return 'id';
  }
  
  if (name.includes('date') || name.includes('time') || name === 'startTime' || name === 'endTime' || 
      name === 'createdAt' || name === 'updatedAt' || name === 'timestamp') {
    if (name.includes('time') || name.includes('timestamp')) {
      return 'datetime';
    }
    return 'date';
  }
  
  if (name.includes('count') || name.includes('limit') || name.includes('offset') || 
      name.includes('page') || name.includes('size') || name.includes('total') || 
      name.includes('index') || name.includes('num') || name.includes('top') || 
      name.includes('skip') || name.includes('price') || name.includes('amount')) {
    return 'number';
  }
  
  if (name.includes('is') || name.includes('has') || name.includes('can') || 
      name.includes('should') || name.includes('enable') || name.includes('disable') || 
      name.includes('active') || name.includes('visible') || name.includes('flag')) {
    return 'boolean';
  }
  
  if (name.includes('list') || name.includes('array') || name.includes('items') || 
      name.includes('elements') || name.includes('collection') || name === 'ids' || 
      name.endsWith('s') && !name.endsWith('status') && !name.endsWith('address')) {
    return 'array';
  }
  
  if (name.includes('object') || name.includes('json') || name.includes('config') || 
      name.includes('options') || name.includes('settings') || name.includes('data') || 
      name.includes('params') || name.includes('metadata')) {
    return 'object';
  }
  
  // Par défaut, considérer comme string
  return 'string';
}

/**
 * Génère un exemple de valeur basé sur le type détecté
 */
export function generateExampleValue(type: ParameterType, name?: string): string {
  switch (type) {
    case 'string':
      if (name?.includes('name')) return 'example';
      if (name?.includes('email')) return 'user@example.com';
      if (name?.includes('title')) return 'Example Title';
      return '';
    case 'number':
      if (name?.includes('page')) return '1';
      if (name?.includes('limit') || name?.includes('size') || name?.includes('top')) return '10';
      if (name?.includes('skip') || name?.includes('offset')) return '0';
      return '0';
    case 'boolean':
      return 'true';
    case 'date':
      return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    case 'datetime':
      return new Date().toISOString(); // YYYY-MM-DDThh:mm:ss.sssZ
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    case 'id':
      return 'id123';
    case 'path':
      return 'path';
    default:
      return '';
  }
} 