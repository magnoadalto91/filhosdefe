export default function LoadingSpinner({ size = 40, fullScreen = false }) {
  const spinner = (
    <div
      className="rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(200,151,43,0.15)',
        borderTopColor: '#c8972b',
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
