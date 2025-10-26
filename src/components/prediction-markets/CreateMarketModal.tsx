import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CreateMarketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMarketModal({ open, onOpenChange }: CreateMarketModalProps) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [outcomes, setOutcomes] = useState(['Yes', 'No'])
  const [resolutionDate, setResolutionDate] = useState<Date>()
  const [initialLiquidity, setInitialLiquidity] = useState('')

  const addOutcome = () => {
    if (outcomes.length < 10) {
      setOutcomes([...outcomes, ''])
    }
  }

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index))
    }
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const handleSubmit = () => {
    // Validation
    if (!question.trim()) {
      toast.error('Please enter a market question')
      return
    }
    if (!category) {
      toast.error('Please select a category')
      return
    }
    if (outcomes.some(o => !o.trim())) {
      toast.error('All outcomes must have a label')
      return
    }
    if (!resolutionDate) {
      toast.error('Please select a resolution date')
      return
    }
    if (!initialLiquidity || parseFloat(initialLiquidity) <= 0) {
      toast.error('Please enter initial liquidity')
      return
    }

    // Mock market creation
    toast.success('Market created successfully!', {
      description: 'Your prediction market is now live',
    })

    // Reset form
    setQuestion('')
    setDescription('')
    setCategory('')
    setOutcomes(['Yes', 'No'])
    setResolutionDate(undefined)
    setInitialLiquidity('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prediction Market</DialogTitle>
          <DialogDescription>
            Create a new market for others to trade on. You'll provide initial liquidity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Market Question *</Label>
            <Input
              id="question"
              placeholder="Will Bitcoin reach $100,000 by end of 2025?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {question.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional context and resolution criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai-agents">AI Agents</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="competitions">Competitions</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Outcomes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Outcomes * (min 2, max 10)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOutcome}
                disabled={outcomes.length >= 10}
                className="gap-2"
              >
                <Plus className="h-3 w-3" />
                Add Outcome
              </Button>
            </div>
            <div className="space-y-2">
              {outcomes.map((outcome, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Outcome ${index + 1}`}
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                  />
                  {outcomes.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOutcome(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Date */}
          <div className="space-y-2">
            <Label>Resolution Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !resolutionDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {resolutionDate ? format(resolutionDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={resolutionDate}
                  onSelect={setResolutionDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Initial Liquidity */}
          <div className="space-y-2">
            <Label htmlFor="liquidity">Initial Liquidity (USDC) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="liquidity"
                type="number"
                placeholder="100.00"
                value={initialLiquidity}
                onChange={(e) => setInitialLiquidity(e.target.value)}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum: $100 USDC • You'll receive LP shares proportional to your liquidity
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Create Market
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
