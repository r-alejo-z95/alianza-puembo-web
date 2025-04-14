import Navbar from "./navbar";

export default function Hero() {
  return (
    <main
      className="h-screen w-screen bg-cover bg-top bg-no-repeat"
      style={{
        backgroundImage: "url('/hero.jpg')",
      }}
    >
      <Navbar />
    </main>
  );
}
