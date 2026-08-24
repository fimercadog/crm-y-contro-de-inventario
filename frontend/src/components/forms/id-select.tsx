"use client"

import { useMemo } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface IdSelectOption {
  value: string
  label: string
}

interface IdSelectProps {
  value: string
  onChange: (value: string) => void
  options: IdSelectOption[]
  placeholder?: string
  className?: string
}

/**
 * A Select bound to an id-like value (a FK: customer, user, stage, category...).
 * Base UI's <Select.Value> shows the raw value unless given an `items` map,
 * unlike Radix which read the matching <Select.Item>'s children — so every
 * id-keyed select in the app needs this, not just a bare SelectValue.
 */
export function IdSelect({ value, onChange, options, placeholder, className }: IdSelectProps) {
  const items = useMemo(
    () => Object.fromEntries(options.map((option) => [option.value, option.label])),
    [options]
  )

  return (
    <Select items={items} value={value} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger className={className ?? "w-full"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
