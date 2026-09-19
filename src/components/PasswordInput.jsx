import { useState } from 'react'

export default function PasswordInput({ value, onChange, required = true, placeholder, minLength }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="password-input">
            <input
                type={visible ? 'text' : 'password'}
                required={required}
                minLength={minLength}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <button
                type="button"
                className="password-input__toggle"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {visible ? '🙈' : '👁️'}
            </button>
        </div>
    )
}
