"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ChatbotErrorBoundaryProps {
  children: ReactNode;
  onRefresh?: () => void;
}

interface ChatbotErrorBoundaryState {
  hasError: boolean;
}

export class ChatbotErrorBoundary extends Component<
  ChatbotErrorBoundaryProps,
  ChatbotErrorBoundaryState
> {
  constructor(props: ChatbotErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChatbotErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chatbot error:", error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false });
    this.props.onRefresh?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="mb-3 text-sm font-medium text-amber-800">
            Something went wrong. Messages preserved.
          </p>
          <button
            type="button"
            onClick={this.handleRefresh}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
