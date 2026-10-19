import { useState, useEffect } from "react";
import type { MemphisConnectAuth } from "../lib/useMemphisConnect";
import {
  KeyIcon,
  CloseIcon,
  ShieldCheckIcon,
  WarningIcon,
} from "./Icons";

interface MemphisModalProps {
  isOpen: boolean;
  auth: MemphisConnectAuth;
  onClose: () => void;
}

export function MemphisModal({ isOpen, auth, onClose }: MemphisModalProps) {
  const [handle, setHandle] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const h = handle.trim();
    const formattedHandle = h ? (h.endsWith(".thebes") ? h : `${h}.thebes`) : undefined;
    try {
      await auth.signIn({
        mode: "auto",
        handle: formattedHandle,
      });
      onClose();
    } catch {
      // Handled by auth.error or cancellation
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="memphis-modal-title"
    >
      <div className="modal-dialog memphis-dialog">
        <div className="memphis-modal-header">
          <div className="memphis-title-wrap">
            <div className="memphis-icon-badge">
              <KeyIcon size={20} />
            </div>
            <div>
              <h3 id="memphis-modal-title">Thebes Memphis Identity</h3>
              <p className="memphis-subtitle">
                Origin-Scoped WebAuthn Passkey · Canister 921
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn icon-btn-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content based on auth state */}
        <div className="memphis-modal-body">
          {auth.signedIn ? (
            <div className="memphis-signed-in">
              <div className="memphis-id-card">
                <div className="memphis-avatar">
                  <ShieldCheckIcon size={28} />
                </div>
                <div className="memphis-info">
                  <span className="memphis-label">Active Memphis Account</span>
                  <div className="memphis-name-row">
                    <span className="memphis-name">{auth.displayName}</span>
                    {auth.session?.name && (
                      <span className="memphis-tag">
                        @{auth.session.name.replace(".thebes", "")}
                      </span>
                    )}
                  </div>
                  {auth.session?.anchorId && (
                    <span className="memphis-anchor">
                      Anchor ID: {auth.session.anchorId.slice(0, 10)}...
                      {auth.session.anchorId.slice(-8)}
                    </span>
                  )}
                  {auth.session?.origin && (
                    <span className="memphis-anchor" style={{ display: "block", marginTop: 2 }}>
                      Scoped Origin: {auth.session.origin}
                    </span>
                  )}
                </div>
              </div>

              <div className="memphis-security-tip">
                <ShieldCheckIcon size={16} />
                <span>
                  Your session is secured cryptographically with an origin-scoped token minted by Memphis at <code>memphis.mercaturaforum.com</code>.
                </span>
              </div>

              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Done
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    auth.signOut();
                    onClose();
                  }}
                  disabled={auth.busy}
                >
                  {auth.busy ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="memphis-form">
              <label htmlFor="memphis-handle-input" className="form-label">
                Memphis Handle (Optional)
              </label>

              <div className="memphis-input-wrap">
                <input
                  id="memphis-handle-input"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="alice"
                  className="form-input memphis-input"
                  autoComplete="username webauthn"
                  disabled={auth.busy}
                />
                <span className="input-suffix">.thebes</span>
              </div>

              <p className="field-hint">
                Enter an existing handle to sign in, or leave blank to authenticate with any registered biometric passkey on your device.
              </p>

              {auth.error && (
                <div className="alert-banner error">
                  <WarningIcon size={16} />
                  <span>{auth.error}</span>
                </div>
              )}

              <div className="memphis-dev-note">
                <p>
                  <strong>Memphis Connect Ceremony:</strong> A secure authentication window opens at <code>memphis.mercaturaforum.com</code> to verify your passkey and mint an origin-scoped session token. On localhost, note previews and local browser storage remain fully functional.
                </p>
              </div>

              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={auth.busy}
                >
                  {auth.busy ? (
                    <>
                      <span className="btn-spinner" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <KeyIcon size={16} />
                      Sign in with Passkey
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
