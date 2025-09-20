import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidatedInputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  sanitize?: (value: string) => string
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, label, error, helperText, required, sanitize, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value
      
      // Apply sanitization if provided
      if (sanitize) {
        value = sanitize(value)
        e.target.value = value
      }
      
      onChange?.(e)
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              error && "border-destructive focus:ring-destructive",
              className
            )}
            onChange={handleChange}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="text-sm">
            {error ? (
              <p className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            ) : (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

ValidatedInput.displayName = "ValidatedInput"

export { ValidatedInput }