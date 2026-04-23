import React from 'react'

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled, 
  isLoading,
  ...props 
}, ref) => {
  
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded transition-colors duration-200 ease focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-bg-dark shadow-lg shadow-primary/20',
    secondary: 'bg-surface hover:bg-surface/80 text-white border border-muted/30',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-surface text-white'
  }

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  }

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button 
      ref={ref} 
      className={classes} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      ) : null}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
