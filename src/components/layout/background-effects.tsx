export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 flex justify-center items-center pointer-events-none">
      <div className="absolute top-[-10%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
    </div>
  );
}
