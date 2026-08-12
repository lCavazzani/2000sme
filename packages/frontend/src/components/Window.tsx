import type { ReactNode } from "react";
import styles from "./Window.module.css";
import { Rnd } from "react-rnd";

type WindowProps = {
  title: string;
  icon?: string;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  isFocused?: boolean;
};

export function Window({
  title,
  icon,
  children,
  onClose,
  onMinimize,
}: WindowProps) {
  return (
    <Rnd
      dragHandleClassName={styles.titleBar}
      minWidth={200}
      minHeight={150}
      enableResizing={{
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      }}
    >
      <div className={`window ${styles.window}`}>
        <div className={`title-bar ${styles.titleBar}`}>
          <div className="title-bar-text">
            {icon && (
              <img
                src={icon}
                alt=""
                width={16}
                height={16}
                className={styles.icon}
              />
            )}
            {title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={onMinimize} />
            <button aria-label="Maximize" />
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">{children}</div>
      </div>
    </Rnd>
  );
}
