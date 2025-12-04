// Button Component
export default function Button({ children, variant = 'primary', onClick, className = '' }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
