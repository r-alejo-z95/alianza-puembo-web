'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { textShadow, pageTitle, pageDescription, imageHeaderContainer } from "@/lib/styles";

export function QueCreemosHeader() {
    return (
        <div className={imageHeaderContainer}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
            >
                <Image
                    src="/conocenos/que-creemos/Que-creemos.webp"
                    alt="Silueta de manos levantadas en adoración"
                    fill
                    priority
                    className="object-cover object-center"
                />
            </motion.div>
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center text-center text-white px-4 h-full">
                <h1 className={`${pageTitle} ${textShadow}`}>
                    Nuestra Fe y Valores
                </h1>
                <p className={`${pageDescription} ${textShadow} max-w-2xl`}>
                    Somos una familia de fe, unidos por lo que creemos y la misión que Dios nos ha encomendado.
                </p>
            </div>
        </div>
    )
}
