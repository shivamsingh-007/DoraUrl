"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: "What is Vengeance UI?", answer: "Vengeance UI is a high-performance, dark-mode first component library designed for the next generation of web applications." },
  { question: "Can I use it with Tailwind CSS?", answer: "Yes! All components are built on top of Tailwind CSS and highly customizable using utility classes." },
  { question: "Are the components accessible?", answer: "Accessibility is a core focus. We ensure proper ARIA attributes, keyboard navigation, and semantic HTML structure." },
  { question: "Do I need to install a heavy npm package?", answer: "No. Vengeance UI provides a CLI that lets you copy and paste only the components you need directly into your project." },
  { question: "Is it compatible with React and Next.js?", answer: "Absolutely. The library is built with React in mind and perfectly supports Next.js Server Components and client-side rendering." },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Vengeance UI FAQs",
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const baseId = useId();

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto py-8 relative font-body", className)} {...props}>
      {title && (
        <h2 className="text-center font-display font-bold text-2xl md:text-3xl mb-10 text-ink">
          {title}
        </h2>
      )}

      <ul className="w-full mx-auto list-none p-0 flex flex-col">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const buttonId = `${baseId}-button-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b-2 border-stone-line",
                "last:border-b-0",
                isActive ? "border-b border-dora/30" : ""
              )}
            >
              <button
                id={buttonId}
                aria-controls={panelId}
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[60px] py-4 relative m-0 px-4 pl-14 cursor-pointer",
                  "border-l-[6px] md:border-l-[10px] transition-colors duration-200 text-left outline-none text-base md:text-lg font-display font-bold",
                  isActive
                    ? "border-l-dora bg-white/70 text-ink"
                    : "border-l-dora/25 bg-transparent text-muted-ink hover:border-l-dora hover:text-ink hover:bg-white/60"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none",
                    isActive ? "text-[32px] md:text-[40px] font-normal text-dora-deep" : "text-[24px] md:text-[30px] font-normal text-dora/50"
                  )}
                >
                  {isActive ? "-" : "+"}
                </span>

                <span className="pr-8">{item.question}</span>

                {/* Chevron */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-6 block w-2 h-2 border-t-[3px] border-r-[3px] transition-transform duration-200 ease-in-out",
                    isActive ? "rotate-[-44deg] border-dora-deep" : "rotate-[133deg] border-dora/40"
                  )}
                />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px] md:border-l-[10px]",
                  isActive ? "grid-rows-[1fr] border-l-bell bg-bell/10" : "grid-rows-[0fr] border-l-dora/25 bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-14 pb-6 pt-2 text-base md:text-lg font-normal text-muted-ink">
                    <span className="opacity-90">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
