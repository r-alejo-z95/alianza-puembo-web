import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Estamos actualizando | Alianza Puembo",
  description: "Estamos trabajando para brindarte una mejor experiencia.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--puembo-green)] opacity-10 blur-[120px] -z-10" />
      
      <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center">
          <Image 
            src="/brand/logo-puembo-white.png" 
            alt="Alianza Puembo" 
            width={200} 
            height={80} 
            className="h-12 w-auto"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
            Regresamos <br />
            <span className="text-[var(--puembo-green)] italic">pronto.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto">
            Estamos realizando mejoras técnicas en nuestra plataforma para servir mejor a nuestra comunidad. 
          </p>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[var(--puembo-green)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
              Actualización en curso
            </span>
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            Una Familia de Familias
          </p>
        </div>

        <Link 
          href="/login" 
          className="inline-block text-[9px] text-gray-800 hover:text-gray-400 transition-colors uppercase tracking-widest"
        >
          Acceso Administrativo
        </Link>
      </div>
    </main>
  );
}
