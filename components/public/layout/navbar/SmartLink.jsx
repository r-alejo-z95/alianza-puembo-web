// Componente para manejar enlaces internos y externos

import Link from "next/link";

const SmartLink = ({ href, children, className = "", onClick, ...props }) => {
  const isExternal = href.startsWith("http");
  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  ) : (
    <Link href={href} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  );
};

export default SmartLink;
