"use client";

import { forwardRef, useState, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface CpfInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

const CpfInput = forwardRef<HTMLInputElement, CpfInputProps>(
  ({ className, onChange, value: propValue, ...props }, ref) => {
    const [value, setValue] = useState(propValue || "");

    useEffect(() => {
      if (propValue !== undefined) {
        setValue(propValue);
      }
    }, [propValue]);

    const formatCpf = (input: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, "");

      // Apply CPF format: XXX.XXX.XXX-XX
      if (digits.length === 0) {
        return "";
      } else if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      } else if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      } else {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatCpf(inputValue);

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
        placeholder="000.000.000-00"
        maxLength={14}
        className={cn(className)}
      />
    );
  }
);

CpfInput.displayName = "CpfInput";

export { CpfInput };
