'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { textShadow, pageTitle, pageDescription, imageHeaderContainer } from "@/lib/styles";

export function PageHeader({ title, description, imageUrl, imageAlt }) {
    return (
        <div className={imageHeaderContainer}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
            >
                <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    priority
                    className="object-cover object-center"
                />
            </motion.div>
            <div className="absolute inset-0 bg-black/30 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center text-center text-white px-4 h-full">
                <h1 className={`${pageTitle} ${textShadow}`}>
                    {title}
                </h1>
                {description && (
                    <p className={`${pageDescription} ${textShadow} max-w-2xl`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}