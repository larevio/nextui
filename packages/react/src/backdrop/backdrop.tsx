/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { MouseEvent, useCallback, useMemo } from 'react';
import withDefaults from '../utils/with-defaults';
import CSSTransition from '../utils/css-transition';
import { CSS } from '../theme/stitches.config';
import useCurrentState from '../use-current-state';
import cslx from '../utils/clsx';
import useKeyboard, { KeyCode } from '../use-keyboard';
import {
  StyledBackdrop,
  StyledBackdropLayer,
  StyledBackdropContent,
  BackdropVariantsProps
} from './backdrop.styles';
import { __DEV__ } from '../utils/assertion';

interface Props {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent | KeyboardEvent) => void;
  visible?: boolean;
  preventDefault?: boolean;
  maxWidth?: string;
  animated?: boolean;
  blur?: boolean;
  opacity?: number;
  css?: CSS;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const defaultProps = {
  onClick: () => {},
  visible: false,
  blur: false,
  animated: true,
  preventDefault: true,
  opacity: 0.5,
  className: ''
};

type NativeAttrs = Omit<React.HTMLAttributes<unknown>, keyof Props>;

export type BackdropProps = Props &
  typeof defaultProps &
  NativeAttrs &
  BackdropVariantsProps;

const preClass = 'nextui-backdrop';

const Backdrop: React.FC<React.PropsWithChildren<BackdropProps>> = React.memo(
  ({
    children,
    onClick,
    onKeyPress,
    visible,
    maxWidth,
    blur,
    animated,
    opacity,
    preventDefault,
    className,
    css,
    ...props
  }) => {
    const [, setIsContentMouseDown, IsContentMouseDownRef] =
      useCurrentState(false);
    const clickHandler = (event: MouseEvent<HTMLElement>) => {
      if (IsContentMouseDownRef.current) return;
      onClick && onClick(event);
    };
    const childrenClickHandler = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      },
      []
    );
    const mouseUpHandler = () => {
      if (!IsContentMouseDownRef.current) return;
      const timer = setTimeout(() => {
        setIsContentMouseDown(false);
        clearTimeout(timer);
      }, 0);
    };

    const { bindings } = useKeyboard(
      (ev: React.KeyboardEvent | KeyboardEvent) => {
        onKeyPress && onKeyPress(ev);
      },
      [KeyCode.Escape, KeyCode.Space],
      {
        disableGlobalEvent: true,
        preventDefault
      }
    );

    const getState = useMemo(() => {
      return visible ? 'open' : 'closed';
    }, [visible]);

    const renderChildren = useMemo(() => {
      return (
        <StyledBackdrop
          tabIndex={-1}
          role="button"
          aria-hidden={true}
          data-state={getState}
          onClick={clickHandler}
          onMouseUp={mouseUpHandler}
          css={{
            $$backdropOpacity: opacity,
            ...(css as any)
          }}
          className={cslx(preClass, `${preClass}--${getState}`, className)}
          {...bindings}
          {...props}
        >
          <StyledBackdropLayer
            className={cslx(
              `${preClass}-layer`,
              blur ? `${preClass}-layer-blur` : `${preClass}-layer-default`
            )}
            animated={animated}
            blur={blur}
          />
          <StyledBackdropContent
            className={`${preClass}-content`}
            onClick={childrenClickHandler}
            css={{
              maxWidth
            }}
            onMouseDown={() => setIsContentMouseDown(true)}
          >
            {children}
          </StyledBackdropContent>
        </StyledBackdrop>
      );
    }, [children]);

    return (
      <>
        {animated ? (
          <CSSTransition
            name={`${preClass}-wrapper`}
            visible={visible}
            enterTime={20}
            leaveTime={20}
            clearTime={150}
          >
            {renderChildren}
          </CSSTransition>
        ) : visible ? (
          renderChildren
        ) : null}
      </>
    );
  }
);

if (__DEV__) {
  Backdrop.displayName = 'NextUI - Backdrop';
}

Backdrop.toString = () => '.nextui-backdrop';

export default withDefaults(Backdrop, defaultProps);
