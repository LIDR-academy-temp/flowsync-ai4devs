import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  type: 'email' | 'password'
  autoComplete: string
  value: string
  onChange: (value: string) => void
  error?: string
}

/** Labelled input with an inline, screen-reader-linked error message. */
export function FormField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
}: FormFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
