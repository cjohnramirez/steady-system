"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Info } from "lucide-react";

interface FieldMeta {
  isTouched: boolean;
  isValid: boolean;
  errors?: Array<{ message?: string } | undefined>;
}

interface FieldState<TValue> {
  value?: TValue | null;
  meta: FieldMeta;
}

interface FieldLike<TValue = string> {
  name: string;
  state: FieldState<TValue>;
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
  setValue: (value: TValue) => void;
}

interface FormDateTimeField<TValue = string> {
  field: FieldLike<TValue>;
  description: string;
}

export function FormDateTimeField({
  field,
  description,
}: FormDateTimeField<string>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const value = field.state.value
    ? new Date(field.state.value as string)
    : null;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{description}</FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex justify-start font-normal">
            {value
              ? value.toLocaleString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Select date & time"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col items-center p-4">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => {
              if (date && value) {
                date.setHours(value.getHours(), value.getMinutes());
              }
              field.setValue(date ? date.toISOString() : "");
            }}
          />
          <div className="flex w-full flex-col items-center gap-3">
            <Input
              type="time"
              step="1"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              value={
                value
                  ? value.toLocaleTimeString("en-PH", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "00:00"
              }
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(":");
                const date = new Date(value || new Date());
                date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                field.setValue(date.toISOString());
              }}
            />
            <div className="flex w-full items-center gap-4 rounded-2xl border p-4">
              <Info strokeWidth={1.25} />
              <p>Type in 24-hour format</p>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
