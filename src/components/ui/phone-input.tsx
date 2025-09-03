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
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (propValue !== undefined) {
        // Se o valor prop é apenas números, formatar
        if (/^\d+$/.test(propValue)) {
          setDisplayValue(formatPhoneNumber(propValue));
        } else {
          setDisplayValue(propValue);
        }
      } else {
        setDisplayValue("");
      }
    }, [propValue]);

    const formatPhoneNumber = (digits: string): string => {
      // Remove all non-digits
      const cleanDigits = digits.replace(/\D/g, "");

      // Apply Brazilian phone format
      if (cleanDigits.length === 0) {
        return "";
      } else if (cleanDigits.length <= 2) {
        return `(${cleanDigits}`;
      } else if (cleanDigits.length <= 6) {
        return `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2)}`;
      } else if (cleanDigits.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        return `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`;
      } else {
        // Celular: (XX) XXXXX-XXXX
        return `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 7)}-${cleanDigits.slice(7, 11)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatPhoneNumber(inputValue);

      setDisplayValue(formattedValue);

      if (onChange) {
        // Pass the raw digits for form submission
        const rawDigits = inputValue.replace(/\D/g, "");
        onChange(rawDigits);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true) ||
          // Allow home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        {...props}
        type="tel"
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="(11) 99999-9999"
        className={cn(className)}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
