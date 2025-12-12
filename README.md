# @archive-duck/utils

Utility functions for the archive-duck project, including parsing and formatting functions for database parameters, codes, and titles.

## Installation

Using pnpm:

```bash
pnpm add @archive-duck/utils
```

Using npm:

```bash
npm install @archive-duck/utils
```

Using yarn:

```bash
yarn add @archive-duck/utils
```

## Usage

### Basic Import

```typescript
import {
  parseDBParams,
  stringifyDBParams,
  parseCode,
  parseTitle,
} from '@archive-duck/utils';
```

### API

#### `parseDBParams(str: string | null): Record<string, string>`

Parses a comma-separated string of parameters in the format `key:value,key:value...`

```typescript
const params = parseDBParams('email:test@example.com,name:John%20Doe');
// { email: 'test@example.com', name: 'John Doe' }
```

#### `stringifyDBParams(data: Record<string, string | number | boolean>): string`

Converts a record of parameters to a comma-separated string format.

```typescript
const str = stringifyDBParams({ email: 'test@example.com', active: true });
// 'email:test%40example.com,active:true'
```

#### `parseCode(str: string, ignoreError?: boolean): string`

Parses and normalizes archive codes. Converts Latin characters to Cyrillic, normalizes special terms, and extracts numeric patterns.

```typescript
const code = parseCode('АБВ-123/2024');
// Returns normalized code as uppercase string
```

**Special behavior:**
- Converts Latin characters to Cyrillic equivalents
- Removes leading zeros
- Shortens: 'доп'/'додо' → 'д', 'том' → 'т', 'частина' variants → 'ч'
- For codes ending with '.': replaces dot with 'н'
- For codes longer than 12 characters: extracts numeric patterns or truncates to 10 characters

**Options:**
- `ignoreError`: If `true`, returns empty string instead of throwing on empty code. Default: `false`

#### `parseTitle(str?: string): string`

Normalizes title text by removing HTML entities, replacing newlines and extra spaces.

```typescript
const title = parseTitle('Document&nbsp;Title\nWith   Spaces');
// 'Document Title With Spaces'
```

**Features:**
- Removes HTML non-breaking spaces (`&nbsp;`)
- Replaces newlines with spaces
- Collapses multiple spaces to single space
- Limits to 200 characters
- Trims whitespace
- Preserves special characters and formatting

## Development

### Setup

```bash
pnpm install
```

### Build

```bash
pnpm run build
```

### Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm run test:coverage
```

### Linting

```bash
pnpm run lint
```

### Formatting

```bash
pnpm run format
```

## Publishing

### Setup

1. Update the version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create a git tag: `git tag v1.0.0`
4. Push to GitHub: `git push origin main && git push origin v1.0.0`

### Publish to npm

```bash
pnpm publish
```

## Dependencies

- **lodash-es**: Utility library for working with arrays, objects, and other data types

## Dev Dependencies

- **TypeScript**: Type safety and modern JavaScript features
- **Vitest**: Fast unit testing framework
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **@vitest/coverage-v8**: Code coverage reporting

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

- GitHub: [archive-duck](https://github.com/yourusername/archive-duck)
