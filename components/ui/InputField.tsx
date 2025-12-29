import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </label>

      <input
        className={`
          w-full bg-muted border border-border p-3 rounded-xl
          focus:border-primary outline-none transition-all text-foreground
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default InputField;
