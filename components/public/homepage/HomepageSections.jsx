'use client';

import dynamic from 'next/dynamic';

const Info = dynamic(() => import("./Info"), { ssr: false });
const Grupos = dynamic(() => import("./Grupos"), { ssr: false });
const Ubicacion = dynamic(() => import("./Ubicacion"), { ssr: false });

export default function HomepageSections() {
  return (
    <>
      <Info />
      <Grupos />
      <Ubicacion />
    </>
  );
}