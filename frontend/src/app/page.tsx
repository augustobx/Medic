import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-8 shadow-glow-primary">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">MedicTurn</span>
        </h1>
        <p className="text-xl text-surface-400 mb-10 max-w-md mx-auto">
          Gestión inteligente de turnos médicos e historias clínicas electrónicas
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            id="btn-login-home"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg shadow-glow-primary hover:shadow-lg hover:from-primary-400 hover:to-primary-500 transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto text-center"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            id="btn-register-home"
            className="px-8 py-3.5 rounded-xl border border-surface-600 text-surface-300 font-semibold text-lg hover:border-primary-500/50 hover:text-primary-400 transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto text-center"
          >
            Crear Cuenta
          </Link>
        </div>

        <p className="mt-12 text-sm text-surface-500">
          ¿Sos paciente?{' '}
          <Link href="/booking" className="text-primary-400 hover:text-primary-300 underline underline-offset-4 transition-colors">
            Reservá tu turno aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
