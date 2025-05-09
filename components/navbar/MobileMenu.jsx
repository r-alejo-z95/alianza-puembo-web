// Menú móvil con acordeones para subrutas

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import SmartLink from "./SmartLink";

const MobileMenu = ({ items, onLinkClick }) => (
  <div className="w-full md:w-2/3 max-h-[calc(100vh-160px)] mx-auto flex flex-col px-4 overflow-y-auto lg:hidden">
    <Accordion type="single" collapsible>
      {items.map((item, idx) =>
        item.subroutes ? (
          <AccordionItem key={idx} value={item.name}>
            <AccordionTrigger className="text-white uppercase font-medium text-lg">
              {item.name}
            </AccordionTrigger>
            <AccordionContent>
              {item.subroutes.map((sub, subIdx) => (
                <SmartLink
                  key={subIdx}
                  href={sub.href}
                  className="block px-4 py-4 text-primary border-b bg-muted last:border-b-0"
                  onClick={onLinkClick}
                >
                  {sub.name}
                </SmartLink>
              ))}
            </AccordionContent>
          </AccordionItem>
        ) : (
          <SmartLink
            key={idx}
            href={item.href}
            className="text-white uppercase font-medium text-lg py-4 block border-b last:border-b-0"
            onClick={onLinkClick}
          >
            {item.name}
          </SmartLink>
        )
      )}
    </Accordion>
  </div>
);

export default MobileMenu;
