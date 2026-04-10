"use client";

import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  className?: string;
};

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  type = "text",
  ...input
}: Props<T> & Omit<ComponentProps<typeof Input>, "name"> & { type?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={String(name)}>{label}</Label>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          <Input
            {...field}
            {...input}
            id={String(name)}
            type={type}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  rows = 4,
  ...rest
}: Props<T> & { rows?: number } & Omit<ComponentProps<typeof Textarea>, "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={String(name)}>{label}</Label>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          <Textarea
            {...field}
            {...rest}
            id={String(name)}
            rows={rows}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("flex items-start gap-3", className)}>
          <Checkbox
            id={String(name)}
            checked={Boolean(field.value)}
            onCheckedChange={(v) => field.onChange(Boolean(v))}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor={String(name)} className="cursor-pointer font-normal">
              {label}
            </Label>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {fieldState.error ? (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
