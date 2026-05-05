"use client";

import Link from "next/link";
import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class FrontlineErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    if (typeof console !== "undefined") {
      console.error("[FrontlineBattle] crashed", error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080a0d] px-6 py-10 text-center text-white shadow-[0_34px_95px_rgba(0,0,0,0.5)]">
          <div className="mx-auto max-w-md space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.32em] text-rose-200/72">Combat error</div>
            <h2 className="text-2xl font-black">The battle could not continue.</h2>
            <p className="text-sm text-white/64">
              An unexpected error stopped the engine. Your save is safe; you can restart the battle or return home.
            </p>
            <pre className="max-h-32 overflow-auto rounded-[12px] border border-white/10 bg-black/40 p-3 text-left text-[10px] text-rose-100/80">
              {this.state.error.message}
            </pre>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white"
                onClick={() => this.setState({ error: null })}
              >
                Retry
              </button>
              <Link
                href="/"
                className="rounded-full border border-[#f5c451]/40 bg-[#f5c451]/16 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#fff0bd]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
