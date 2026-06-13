export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
  return (
    <div className={`${s} border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin`} />
  )
}
