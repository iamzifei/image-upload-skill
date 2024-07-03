import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import React, { useEffect, useImperativeHandle, useState } from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  inline?: boolean
  rounded?: string
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      name,
      label,
      errors,
      touched,
      required,
      inline = false,
      placeholder,
      rounded = "rounded-2xl",
      className,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="w-full">
        <div className="relative z-0 w-full text-base">
          <label htmlFor={`id-${name}`} onClick={() => inputRef.current?.focus()} className="relative block">
            {!inline && label && (
              <span className={clsx("mb-1 block text-neutral-800 dark:text-neutral-200", {})}>
                {required ? `${label} *` : label}
              </span>
            )}

            <div className="relative">
              <input
                type={inputType}
                id={`id-${name}`}
                name={name}
                placeholder={inline ? label : placeholder}
                className={clsx(
                  `block w-full rounded-md border-neutral-200 bg-gray-200 text-black dark:text-white px-4 py-3 text-xl font-normal focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-purple-600 dark:focus:ring-opacity-25 dark:disabled:bg-neutral-800 outline-purple-500 ${rounded}`,
                  className
                )}
                {...props}
                ref={inputRef}
              />

              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 px-4 text-gray-400 outline-none transition-all duration-150 focus:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
                </button>
              )}
            </div>
          </label>
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
