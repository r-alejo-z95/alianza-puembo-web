import { Button } from "./ui/button";

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen bg-cover bg-top bg-no-repeat z-0"
      style={{ backgroundImage: "url('/Hero.jpg')" }}
    >
      <div className="z-1 w-full h-full flex flex-col items-left justify-center text-white backdrop-brightness-50 px-13 gap-4">
        <h2 className="text-xl">Experimenta la presencia de Dios en casa</h2>
        <h1 className="text-7xl font-bold">Bienvenido</h1>
      </div>
    </section>
  );
}
