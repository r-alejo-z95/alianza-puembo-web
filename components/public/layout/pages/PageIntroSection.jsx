import { cn } from "@/lib/utils.ts";
import { sectionTitle, sectionText, pageSection } from "@/lib/styles";

export function PageIntroSection({ title, description, titleColor }) {
  return (
    <div className={cn(pageSection, "bg-white text-gray-800")}>
      <div className="flex flex-col md:flex-row justify-start md:items-start items-center md:justify-evenly gap-8 md:gap-4 lg:gap-0">
        <div className="flex-1 max-w-xl">
          <h2 className={cn(sectionTitle, "mb-4 text-center", titleColor)}>
            {title}
          </h2>
          <p className={sectionText}>{description}</p>
        </div>
      </div>
    </div>
  );
}
