import Image from "next/image";

export default function Hero() {
  return (
    <main className="relative h-screen w-full">
      <Image
        src="/hero.jpg"
        alt="Hero Image"
        fill
        className="object-cover object-top"
        priority
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-white text-5xl font-bold text-center drop-shadow-lg">
          Bienvenido a la Iglesia Alianza Puembo
        </h1>
      </div>
    </main>
  );
}
