export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
