import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';


import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'file';
}

function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text"
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label">{label}</FormLabel>
          <FormControl>
            <Input 
            className="input"
            type={type} 
            placeholder={placeholder} 
            {...field} 
            />
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormField;
