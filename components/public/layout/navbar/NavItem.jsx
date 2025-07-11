// Elemento individual del menú de navegación

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SmartLink from "./SmartLink";
import DropdownMenu from "./DropdownMenu";
import { headerTextSizes, textShadow } from "@/lib/styles";
import { cn } from "@/lib/utils";

const NavItem = ({ title, href, subroutes, mobile, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses = cn(
    "flex items-center uppercase font-medium text-primary-foreground transition-colors w-full justify-between rounded-md cursor-pointer hover:text-accent lg:w-auto",
    headerTextSizes
  );

  if (subroutes) {
    return (
      <div
        className="relative w-full"
        onMouseEnter={() => !mobile && setIsOpen(true)}
        onMouseLeave={() => !mobile && setIsOpen(false)}
      >
        <div className={cn(baseClasses, textShadow)} onClick={() => setIsOpen(!isOpen)}>
          <span>{title}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </div>
        {mobile ? (
          isOpen && (
            <DropdownMenu
              subroutes={subroutes}
              mobile={mobile}
              onLinkClick={onLinkClick}
            />
          )
        ) : (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenu
                  subroutes={subroutes}
                  mobile={mobile}
                  onLinkClick={onLinkClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <SmartLink href={href} className={cn(baseClasses, textShadow)} onClick={onLinkClick}>
      {title}
    </SmartLink>
  );
};

export default NavItem;
