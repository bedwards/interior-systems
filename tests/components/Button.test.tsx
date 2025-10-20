import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Simple Button component for testing
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, disabled, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="button"
    >
      {label}
    </button>
  );
}

describe('Button Component', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} disabled />);
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies correct variant class', () => {
    const { rerender } = render(
      <Button label="Primary" onClick={() => {}} variant="primary" />
    );
    expect(screen.getByTestId('button')).toHaveClass('btn-primary');

    rerender(<Button label="Secondary" onClick={() => {}} variant="secondary" />);
    expect(screen.getByTestId('button')).toHaveClass('btn-secondary');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click" onClick={() => {}} disabled />);
    expect(screen.getByTestId('button')).toBeDisabled();
  });
});

// Test for useStore hook
describe('Store', () => {
  it('should initialize with default values', async () => {
    const { useStore } = await import('@store/useStore');
    
    const state = useStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.projects).toEqual([]);
    expect(state.isOnline).toBe(true);
  });

  it('should update user state', async () => {
    const { useStore } = await import('@store/useStore');
    
    const mockUser = { id: '123', email: 'test@example.com' } as any;
    useStore.getState().setUser(mockUser);
    
    expect(useStore.getState().user).toEqual(mockUser);
  });
});

// Test for API service
describe('API Service', () => {
  it('should handle offline mode gracefully', async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { api } = await import('@services/supabase');
    
    // API calls should fall back to cache when offline
    const projects = await api.getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });
});