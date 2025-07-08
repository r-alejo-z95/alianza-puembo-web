// Componente para manejar enlaces internos y externos

import Link from "next/link";
import { cn } from "@/lib/utils";
import { textShadow } from "@/lib/styles";

const SmartLink = ({ href, children, className = "", onClick, ...props }) => {
  const isExternal = href.startsWith("http");
  const combinedClassName = cn(className, textShadow);

  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={combinedClassName}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  ) : (
    <Link href={href} className={combinedClassName} onClick={onClick} {...props}>
      {children}
    </Link>
  );
};

export default SmartLink;
