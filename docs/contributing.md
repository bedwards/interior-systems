# Contributing to Interior Systems

Thank you for your interest in contributing to Interior Systems! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git
- A Supabase account (free tier)
- A Cloudflare account (free tier)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/interior-systems.git
   cd interior-systems
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd workers && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start Supabase locally** (optional)
   ```bash
   npm run supabase:start
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

The app should now be running at `http://localhost:5173`

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write your code
2. Add tests for new functionality
3. Run linting and formatting
   ```bash
   npm run lint
   npm run format
   ```
4. Run tests
   ```bash
   npm run test
   ```
5. Ensure coverage stays above 90%
   ```bash
   npm run test:coverage
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(canvas): add circle drawing tool"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs(api): update API documentation"
```

### Submitting a Pull Request

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request on GitHub
   - Use a descriptive title
   - Reference any related issues
   - Provide a clear description of changes
   - Include screenshots for UI changes

3. Wait for review
   - Address any feedback
   - Keep the PR up to date with `main`

4. Once approved, your PR will be merged!

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all props and state
- Avoid `any` type (use `unknown` if needed)
- Enable strict mode in tsconfig.json

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful component and prop names

**Good:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Styling

- Use CSS-in-JS with styled-jsx or inline styles
- Follow BEM naming convention for classes
- Use CSS variables for theming
- Ensure responsive design (mobile-first)

### Testing

- Write unit tests for utilities and services
- Write component tests for UI
- Aim for > 90% code coverage
- Use descriptive test names

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Project Structure

```
interior-systems/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API clients and services
│   ├── store/          # State management
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript types
├── workers/
│   └── src/            # Cloudflare Worker code
├── supabase/
│   └── migrations/     # Database migrations
├── tests/              # Test files
└── docs/               # Documentation
```

## Adding New Features

### Frontend Feature

1. Create component in `src/components/`
2. Add types in component or `src/types/`
3. Write tests in `tests/`
4. Update documentation

### Backend Feature

1. Add migration in `supabase/migrations/`
2. Update RLS policies
3. Test with Supabase CLI

### Worker Feature

1. Add endpoint in `workers/src/handlers/`
2. Update `workers/src/index.ts`
3. Add tests
4. Update API documentation

## Documentation

### Code Comments

- Use JSDoc for functions and classes
- Explain complex logic
- Keep comments up to date

```typescript
/**
 * Calculates the recommended lumens for a room
 * @param area - Room area in square meters
 * @param activity - Type of activity (office, kitchen, etc.)
 * @returns Recommended lumens
 */
export function calculateLumens(area: number, activity: string): number {
  // Implementation
}
```

### Documentation Files

- Update README.md for major features
- Add examples to docs/ directory
- Keep architecture.md current

## Performance Guidelines

- Lazy load routes and components
- Debounce expensive operations
- Use React.memo for expensive renders
- Optimize images and assets
- Minimize bundle size

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## Security

- Never commit secrets or API keys
- Validate all user input
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines

## Getting Help

- **Issues**: Search existing issues or create a new one
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check the docs/ directory
- **Code**: Read the source code and comments

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project credits

Thank you for contributing to Interior Systems! Together, we're democratizing design intelligence.