"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
};

/**
 * Password field with a show/hide toggle.
 * Spread props first so callers can still override e.g. `placeholder`.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ id, className, ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="ob-input-wrap password-input-wrap">
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          className={className}
          {...rest}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff aria-hidden size={17} />
          ) : (
            <Eye aria-hidden size={17} />
          )}
        </button>
      </div>
    );
  },
);

export default PasswordInput;
