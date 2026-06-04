import "./ExcalidrawLogo.scss";

import React, { useState } from "react";

import { ProductLogoIcon } from "./ProductLogoIcon";

type LogoSize = "xs" | "small" | "normal" | "large" | "custom" | "mobile";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  style?: React.CSSProperties;
  /**
   * If true, the logo will not be wrapped in a Link component.
   * The link prop will be ignored as well.
   * It will merely be a plain div.
   */
  isNotLink?: boolean;
}

const Wordmark = ({ className }: { className?: string }) => {
  const [failed, setFailed] = useState(false);
  const base = import.meta.env.BASE_URL || "/";
  const src = `${base}logo-with-text.svg`;

  if (failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt="diagrams.free"
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export const ExcalidrawLogo = ({
  style,
  size = "small",
  withText,
}: LogoProps) => {
  if (withText) {
    return (
      <div
        className={`ExcalidrawLogo ExcalidrawLogo--with-wordmark is-${size}`}
        style={style}
      >
        <Wordmark className="ExcalidrawLogo-text" />
      </div>
    );
  }

  return (
    <div className={`ExcalidrawLogo is-${size}`} style={style}>
      <ProductLogoIcon className="ExcalidrawLogo-icon" />
    </div>
  );
};
