'use client';

export default function LoginButton() {
  function handleLogin() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-white text-black text-sm rounded-sm hover:bg-[#e0e0e0] transition-colors"
    >
      Sign in with Google
    </button>
  );
}
