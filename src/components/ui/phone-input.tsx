"use client";

import { forwardRef, useState, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value: propValue, ...props }, ref) => {
    const [value, setValue] = useState(propValue || "");

    useEffect(() => {
      if (propValue !== undefined) {
        setValue(propValue);
      }
    }, [propValue]);

    const formatPhoneNumber = (input: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, "");

      // Apply Brazilian phone format: (XX) XXXXX-XXXX
      if (digits.length <= 2) {
        return digits;
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
          6
        )}`;
      } else {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
          7,
          11
        )}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatPhoneNumber(inputValue);

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
        type="tel"
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        className={cn(className)}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
