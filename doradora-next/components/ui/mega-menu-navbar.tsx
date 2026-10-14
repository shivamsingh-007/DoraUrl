"use client";

import * as React from "react";
import {
  BellRing,
  BookOpen,
  Brain,
  ChevronDown,
  Code2,
  DoorOpen,
  FileText,
  Flashlight,
  Link2,
  Menu,
  MessagesSquare,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface MegaMenuItem {
  title: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: string;
}

export interface MegaMenuResourceGroup {
  title: string;
  links: MegaMenuItem[];
}

export interface MegaMenuNavbarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  brandName?: string;
  brandHref?: string;
  logo?: React.ReactNode;
  features?: MegaMenuItem[];
  useCases?: MegaMenuItem[];
  resourceGroups?: MegaMenuResourceGroup[];
  pricingHref?: string;
  loginHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

type DesktopMenu = "features" | "use-cases" | "resources" | null;
type MobileSection = Exclude<DesktopMenu, null>;

const DEFAULT_FEATURES: MegaMenuItem[] = [
  {
    title: "Anywhere Door",
    description: "Step through with any long URL, come out with a short one.",
    href: "#studio",
    icon: DoorOpen,
    iconClassName: "text-dora",
    badge: "Try it",
  },
  {
    title: "Small Light",
    description: "Shrink links to pocket size in one click.",
    href: "#studio",
    icon: Flashlight,
    iconClassName: "text-dorayaki",
  },
  {
    title: "Memory Bread",
    description: "Same URL memorized — the same code comes back.",
    href: "#craft",
    icon: Brain,
    iconClassName: "text-dora-deep",
  },
  {
    title: "Time Furoshiki",
    description: "Expiry wrapped honestly, unwrapped on schedule.",
    href: "#craft",
    icon: Timer,
    iconClassName: "text-dorayaki",
  },
  {
    title: "Bell Rings",
    description: "Every arrival through the Door counts a ring.",
    href: "#studio",
    icon: BellRing,
    iconClassName: "text-dora",
  },
  {
    title: "4D Pocket Guard",
    description: "Bloom-checked codes, verified before every hop.",
    href: "#method",
    icon: ShieldCheck,
    iconClassName: "text-dora-deep",
  },
];

const DEFAULT_USE_CASES: MegaMenuItem[] = [
  {
    title: "Gadget Lab",
    description: "Mint links with the Small Light, live in your browser.",
    href: "#studio",
    icon: Flashlight,
  },
  {
    title: "Gadget Shelf",
    description: "Meet the four gadgets behind every short link.",
    href: "#craft",
    icon: Sparkles,
  },
  {
    title: "Inside the Pocket",
    description: "Snowflake IDs, Base62 codes and honest expiry.",
    href: "#method",
    icon: Code2,
  },
];

const DEFAULT_RESOURCE_GROUPS: MegaMenuResourceGroup[] = [
  {
    title: "Visit",
    links: [
      { title: "Gadget Lab", href: "#studio", icon: Flashlight },
      { title: "Gadgets", href: "#craft", icon: Sparkles },
      { title: "Pocket Rules", href: "#principles", icon: BookOpen },
    ],
  },
  {
    title: "Learn",
    links: [
      { title: "How codes are minted", href: "#method", icon: Code2 },
      { title: "Why 7 characters", href: "#faq", icon: FileText },
      { title: "Ask at the Door", href: "#faq", icon: MessagesSquare },
    ],
  },
];

function NavAction({
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora focus-visible:ring-offset-2",
        variant === "primary" &&
          "bg-dora text-white shadow-sm hover:-translate-y-px hover:bg-dora-deep hover:shadow-[0_12px_28px_-12px_rgba(14,155,214,0.8)]",
        variant === "ghost" &&
          "text-muted-ink hover:bg-sky hover:text-ink",
        variant === "outline" &&
          "border border-stone-line bg-white text-ink shadow-sm hover:bg-sky",
        className,
      )}
    >
      {children}
    </a>
  );
}

function Brand({
  brandName,
  brandHref,
  logo,
  onNavigate,
}: {
  brandName: string;
  brandHref: string;
  logo?: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={brandHref}
      onClick={onNavigate}
      className="relative z-10 flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-ink dark:text-zinc-50"
    >
      {logo ?? (
        <span className="flex size-8 items-center justify-center rounded-full bg-dora">
          <Link2 className="size-4 text-white" />
        </span>
      )}
      <span className="font-display">{brandName}</span>
    </a>
  );
}

function MenuTrigger({
  id,
  label,
  isOpen,
  onToggle,
  onOpen,
}: {
  id: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={id}
      onClick={onToggle}
      onFocus={onOpen}
      className={cn(
        "flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "text-muted-ink hover:bg-sky hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora",
        "dark:text-sky-200 dark:hover:bg-zinc-800 dark:hover:text-white",
        isOpen && "bg-sky text-ink dark:bg-zinc-800 dark:text-white",
      )}
    >
      {label}
      <ChevronDown
        className={cn(
          "size-3.5 opacity-60 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

function FeatureGrid({ items }: { items: MegaMenuItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              "group/item flex items-start gap-3 rounded-lg p-3 transition-colors",
              "hover:bg-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora/60",
              "dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-700",
            )}
          >
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-stone-line bg-white shadow-sm transition-colors group-hover/item:border-dora/50 dark:border-zinc-800 dark:bg-ink dark:group-hover/item:border-zinc-700">
                <Icon className={cn("size-5", item.iconClassName ?? "text-muted-ink dark:text-sky-200")} />
              </span>
            ) : null}

            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink dark:text-zinc-100">
                  {item.title}
                </span>
                {item.badge ? (
                  <span className="rounded-full border border-dorayaki/40 bg-bell/25 px-1.5 py-0.5 text-[10px] font-semibold text-dorayaki dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              {item.description ? (
                <span className="mt-1 block text-xs leading-relaxed text-muted-ink dark:text-dora">
                  {item.description}
                </span>
              ) : null}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function DesktopDropdown({
  id,
  open,
  className,
  children,
}: {
  id: string;
  open: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full z-50 pt-3 transition-all duration-200",
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0 pointer-events-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MobileAccordion({
  title,
  value,
  openSection,
  onToggle,
  children,
}: {
  title: string;
  value: MobileSection;
  openSection: MobileSection | null;
  onToggle: (value: MobileSection) => void;
  children: React.ReactNode;
}) {
  const isOpen = openSection === value;
  const contentId = `mobile-${value}-content`;

  return (
    <div className="border-b border-stone-line dark:border-zinc-800">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => onToggle(value)}
        className="flex w-full items-center justify-between py-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora dark:text-zinc-100"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-4 text-muted-ink transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-2 flex flex-col gap-1 border-l-2 border-stone-line pl-3 dark:border-zinc-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenuItem({ item, onNavigate }: { item: MegaMenuItem; onNavigate: () => void }) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-ink transition-colors hover:bg-sky hover:text-ink dark:text-dora dark:hover:bg-zinc-900 dark:hover:text-white"
    >
      {Icon ? <Icon className={cn("size-4", item.iconClassName)} /> : null}
      <span>{item.title}</span>
    </a>
  );
}

export function MegaMenuNavbar({
  brandName = "AcmeCorp",
  brandHref = "#",
  logo,
  features = DEFAULT_FEATURES,
  useCases = DEFAULT_USE_CASES,
  resourceGroups = DEFAULT_RESOURCE_GROUPS,
  pricingHref = "#",
  loginHref = "#",
  ctaHref = "#",
  ctaLabel = "Get Started",
  className,
  ...props
}: MegaMenuNavbarProps) {
  const [openMenu, setOpenMenu] = React.useState<DesktopMenu>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileSection, setMobileSection] = React.useState<MobileSection | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const toggleDesktopMenu = (menu: Exclude<DesktopMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const toggleMobileSection = (section: MobileSection) => {
    setMobileSection((current) => (current === section ? null : section));
  };

  return (
    <header
      {...props}
      ref={navRef}
      className={cn(
        "sticky top-0 z-50 w-full border-b hairline bg-sky/80 backdrop-blur-xl",
        "dark:border-zinc-800 dark:bg-ink/80",
        className,
      )}
      onMouseLeave={(event) => {
        setOpenMenu(null);
        props.onMouseLeave?.(event);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Brand brandName={brandName} brandHref={brandHref} logo={logo} />

            <nav aria-label="Primary navigation" className="hidden items-center lg:flex">
              <ul className="flex items-center gap-1">
                <li className="relative" onMouseEnter={() => setOpenMenu("features")}>
                  <MenuTrigger
                    id="features-mega-menu"
                    label="Gadgets"
                    isOpen={openMenu === "features"}
                    onToggle={() => toggleDesktopMenu("features")}
                    onOpen={() => setOpenMenu("features")}
                  />
                  <DesktopDropdown id="features-mega-menu" open={openMenu === "features"} className="w-[640px]">
                    <div className="rounded-xl border border-stone-line bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-ink">
                      <FeatureGrid items={features} />
                      <div className="mt-4 flex items-center justify-between border-t border-stone-line px-2 pt-4 dark:border-zinc-800/70">
                        <span className="text-sm text-muted-ink dark:text-dora">
                          Need a name that reads well aloud?
                        </span>
                        <a
                          href="#studio"
                          className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline dark:text-zinc-100"
                        >
                          Claim an alias
                          <MoveRight className="size-4" />
                        </a>
                      </div>
                    </div>
                  </DesktopDropdown>
                </li>

                <li className="relative" onMouseEnter={() => setOpenMenu("use-cases")}>
                  <MenuTrigger
                    id="use-cases-mega-menu"
                    label="Tour"
                    isOpen={openMenu === "use-cases"}
                    onToggle={() => toggleDesktopMenu("use-cases")}
                    onOpen={() => setOpenMenu("use-cases")}
                  />
                  <DesktopDropdown id="use-cases-mega-menu" open={openMenu === "use-cases"} className="w-[390px]">
                    <div className="rounded-xl border border-stone-line bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-ink">
                      <div className="flex flex-col gap-1">
                        {useCases.map((item) => {
                          const Icon = item.icon;

                          return (
                            <a
                              key={item.title}
                              href={item.href}
                              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora/60 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                            >
                              {Icon ? (
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-stone-line bg-white shadow-sm dark:border-zinc-800 dark:bg-ink">
                                  <Icon className="size-5 text-muted-ink dark:text-sky-200" />
                                </span>
                              ) : null}
                              <span>
                                <span className="block text-sm font-semibold text-ink dark:text-zinc-100">
                                  {item.title}
                                </span>
                                {item.description ? (
                                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-ink dark:text-dora">
                                    {item.description}
                                  </span>
                                ) : null}
                              </span>
                            </a>
                          );
                        })}
                      </div>

                      <div className="mt-2 rounded-lg border border-stone-line bg-cloud p-4 dark:border-zinc-800/70 dark:bg-zinc-900/50">
                        <p className="text-sm font-medium text-ink dark:text-zinc-100">Bell rings</p>
                        <p className="mt-1 text-xs text-muted-ink dark:text-dora">
                          Every arrival through the Door counts a ring.
                        </p>
                        <a href="#studio" className="mt-3 inline-flex text-xs font-medium text-dora-deep hover:underline dark:text-blue-400">
                          See the lab →
                        </a>
                      </div>
                    </div>
                  </DesktopDropdown>
                </li>

                <li>
                  <a
                    href={pricingHref}
                    className="inline-flex rounded-md px-4 py-2 text-sm font-medium text-muted-ink transition-colors hover:bg-sky hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora dark:text-sky-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    FAQ
                  </a>
                </li>

                <li className="relative" onMouseEnter={() => setOpenMenu("resources")}>
                  <MenuTrigger
                    id="resources-mega-menu"
                    label="Pocket"
                    isOpen={openMenu === "resources"}
                    onToggle={() => toggleDesktopMenu("resources")}
                    onOpen={() => setOpenMenu("resources")}
                  />
                  <DesktopDropdown
                    id="resources-mega-menu"
                    open={openMenu === "resources"}
                    className="left-1/2 w-[620px] -translate-x-1/2"
                  >
                    <div className="grid grid-cols-3 gap-6 rounded-xl border border-stone-line bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-ink">
                      <div className="flex flex-col justify-between rounded-xl border border-stone-line bg-cloud p-5 dark:border-zinc-800/70 dark:bg-zinc-900">
                        <div>
                          <span className="flex size-10 items-center justify-center rounded-lg bg-sky text-dora-deep dark:bg-blue-900/50 dark:text-blue-300">
                            <BookOpen className="size-5" />
                          </span>
                          <h4 className="mt-4 text-sm font-semibold text-ink dark:text-zinc-100">
                            Memory Bread
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-muted-ink dark:text-dora">
                            Same URL in, same code out — the lab never mints twins.
                          </p>
                        </div>
                        <a href="#craft" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-dora-deep hover:underline dark:text-blue-400">
                          How dedup works
                          <MoveRight className="size-3.5" />
                        </a>
                      </div>

                      <div className="col-span-2 grid grid-cols-2 gap-5">
                        {resourceGroups.map((group) => (
                          <div key={group.title} className="flex flex-col gap-1">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dora dark:text-muted-ink">
                              {group.title}
                            </h4>
                            {group.links.map((item) => {
                              const Icon = item.icon;

                              return (
                                <a
                                  key={item.title}
                                  href={item.href}
                                  className="flex items-center gap-2 rounded-md p-2 text-sm text-muted-ink transition-colors hover:bg-sky hover:text-ink dark:text-dora dark:hover:bg-zinc-900 dark:hover:text-white"
                                >
                                  {Icon ? <Icon className="size-4 text-dora" /> : null}
                                  {item.title}
                                </a>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </DesktopDropdown>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <NavAction href={loginHref} variant="ghost">
                Take the tour
              </NavAction>
              <NavAction href={ctaHref}>{ctaLabel}</NavAction>
            </div>

            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="flex size-10 items-center justify-center rounded-md text-muted-ink transition-colors hover:bg-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora dark:text-dora dark:hover:bg-zinc-800 lg:hidden"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </div>

      <div
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-out dark:bg-ink lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Brand brandName={brandName} brandHref={brandHref} logo={logo} onNavigate={closeMobile} />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation menu"
            className="flex size-10 items-center justify-center rounded-md text-muted-ink transition-colors hover:bg-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dora dark:text-dora dark:hover:bg-zinc-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="-mx-6 flex-1 overflow-y-auto px-6">
          <MobileAccordion
            title="Gadgets"
            value="features"
            openSection={mobileSection}
            onToggle={toggleMobileSection}
          >
            {features.map((item) => (
              <MobileMenuItem key={item.title} item={item} onNavigate={closeMobile} />
            ))}
          </MobileAccordion>

          <MobileAccordion
            title="Tour"
            value="use-cases"
            openSection={mobileSection}
            onToggle={toggleMobileSection}
          >
            {useCases.map((item) => (
              <MobileMenuItem key={item.title} item={item} onNavigate={closeMobile} />
            ))}
          </MobileAccordion>

          <a
            href={pricingHref}
            onClick={closeMobile}
            className="block border-b border-stone-line py-4 text-sm font-medium text-ink dark:border-zinc-800 dark:text-zinc-100"
          >
            FAQ
          </a>

          <MobileAccordion
            title="Pocket"
            value="resources"
            openSection={mobileSection}
            onToggle={toggleMobileSection}
          >
            {resourceGroups.flatMap((group) =>
              group.links.map((item) => (
                <MobileMenuItem key={`${group.title}-${item.title}`} item={item} onNavigate={closeMobile} />
              )),
            )}
          </MobileAccordion>
        </nav>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
          <NavAction href={loginHref} variant="outline" className="w-full" onClick={closeMobile}>
            Take the tour
          </NavAction>
          <NavAction href={ctaHref} className="w-full" onClick={closeMobile}>
            {ctaLabel}
          </NavAction>
        </div>
      </aside>
    </header>
  );
}

export default MegaMenuNavbar;
