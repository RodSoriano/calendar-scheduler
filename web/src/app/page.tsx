import LoginButton from '@/components/LoginButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] gap-8">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-medium tracking-tight text-white">
          Calendar Scheduler
        </h1>
        <p className="text-sm text-[#888888]">
          Manage your Google Calendar events
        </p>
      </div>
      <LoginButton />
    </main>
  );
}
