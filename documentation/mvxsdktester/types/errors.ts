export class InvalidPatternError extends Error {
  constructor(pattern: string) {
    super(
      `Pattern '${pattern}' contains invalid characters. Only alphanumeric characters, ` +
      'dash (-), underscore (_), dot (.), forward slash (/), plus (+), and asterisk (*) are allowed.'
    );
    this.name = 'InvalidPatternError';
  }
} 