"use client";

import { forwardRef, useState, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface CepInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

const CepInput = forwardRef<HTMLInputElement, CepInputProps>(
  ({ className, onChange, value: propValue, ...props }, ref) => {
    const [value, setValue] = useState(propValue || "");

    useEffect(() => {
      if (propValue !== undefined) {
        setValue(propValue);
      }
    }, [propValue]);

    const formatCep = (input: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, "");

      // Apply CEP format: XXXXX-XXX
      if (digits.length === 0) {
        return "";
      } else if (digits.length <= 5) {
        return digits;
      } else {
        return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatCep(inputValue);

      setValue(formattedValue);

      if (onChange) {
        // Pass the raw digits for form submission
        const rawDigits = inputValue.replace(/\D/g, "");
        onChange(rawDigits);
      }
    };

    return (
      <Input
        {...props}
        type="text"
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="00000-000"
        maxLength={9}
        className={cn(className)}
      />
    );
  }
);

CepInput.displayName = "CepInput";

export { CepInput };
