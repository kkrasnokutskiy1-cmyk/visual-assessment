export default function ResultsLayout({ children }: LayoutProps<"/results">) {
  return <main className="mx-auto w-full max-w-[var(--content-max)] px-6">{children}</main>;
}
