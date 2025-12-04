// Input Component
export default function Input({ type = 'text', placeholder, value, onChange, className = '' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${className}`}
    />
  )
}
