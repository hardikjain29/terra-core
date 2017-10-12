import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'terra-base/lib/baseStyles';
import MenuWidths from './_MenuWidths';
import MenuUtils from './_MenuUtils';
import styles from './Menu.scss';

const cx = classNames.bind(styles);

const propTypes = {
  isSubMenu: PropTypes.bool,
  boundingRef: PropTypes.func,
  isHeightBounded: PropTypes.bool,
  isWidthBounded: PropTypes.bool,
  contentWidth: PropTypes.string,
  children: PropTypes.node,
};

const MenuContent = (props) => {
  const boundingFrame = props.boundingRef ? props.boundingRef() : undefined;
  const isFullScreen = MenuUtils.isFullScreen(props.isHeightBounded, props.isWidthBounded, boundingFrame, MenuWidths[props.contentWidth]);

  const contentClass = cx([
    { submenu: props.isSubMenu },
    { 'main-menu': !props.isSubMenu },
    { fullscreen: isFullScreen },
  ]);

  const children = React.Children.map(props.children, child => (
    React.cloneElement(child, { isHeightBounded: props.isHeightBounded })
  ));

  return (
    <div className={contentClass}>
      {children}
    </div>
  );
};

MenuContent.propTypes = propTypes;
export default MenuContent;
