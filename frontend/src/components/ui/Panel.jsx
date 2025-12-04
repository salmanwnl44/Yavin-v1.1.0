// Panel Component - reusable container
export default function Panel({ title, children, className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
