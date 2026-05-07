export default function LoadingSpinner({ size = 40, fullScreen = false }) {
  const spinner = (
    <div
      className="animate-spin rounded-full"
      style={{ width: size, height: size, border: '3px solid rgba(200,151,43,0.15)', borderTopColor: '#c8972b' }}
    />
  )

  if (fullScreen) {
    return (
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, backgroundColor:'#f8f5f0' }}>
        {spinner}
      </div>
    )
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      {spinner}
    </div>
  )
}
