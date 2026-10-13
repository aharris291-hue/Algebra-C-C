/**
 * Catches a rendering error in a screen, shows a friendly message instead of a blank window, and
 * reports the error to the local log. The student can go back to the dashboard or reload; their
 * work is saved by the main process as they go, so nothing is lost.
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '../errors';

interface Props {
  children: ReactNode;
  /** App remounts the boundary (a new React key) when the screen changes, which clears the error */
  onHome: () => void;
}
interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError('boundary', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="setup" role="alert">
        <div className="setup-card">
          <h1>Something went wrong on this screen</h1>
          <p>Your work so far is saved. Go back to the dashboard and try again, or reload the app.</p>
          <div className="row-buttons">
            <button className="btn btn-primary" autoFocus onClick={() => this.props.onHome()}>
              Return to dashboard
            </button>
            <button className="btn" onClick={() => location.reload()}>
              Reload the app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
