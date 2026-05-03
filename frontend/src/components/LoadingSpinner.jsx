export default function LoadingSpinner({ size = 40, fullScreen = false }) {
  const spinner = (
    <div
      className="rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7C3AED',
      }}
    />
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: '#0D0818' }}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
