import Navbar from "@/components/navbar";

export default function Home() {
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
