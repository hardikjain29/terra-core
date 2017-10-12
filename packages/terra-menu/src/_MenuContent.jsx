import React from 'react';
import PropTypes from 'prop-types';
import List from 'terra-list';
import IconLeft from 'terra-icon/lib/icon/IconLeft';
import ContentContainer from 'terra-content-container';
import IconClose from 'terra-icon/lib/icon/IconClose';
import Arrange from 'terra-arrange';
import classNames from 'classnames/bind';
import 'terra-base/lib/baseStyles';
import MenuUtils from './_MenuUtils';
import styles from './Menu.scss';

const cx = classNames.bind(styles);

const propTypes = {
  /**
   * Title the should be displayed in header.
   */
  title: PropTypes.string,
  /**
   * Callback function for when back button is clicked.
   */
  onRequestBack: PropTypes.func,
  /**
   * Callback function for when close button is clicked.
   */
  onRequestClose: PropTypes.func,
  /**
   * Callback function that takes the content to be displayed next and is called when an item with nested content is clicked.
   */
  onRequestNext: PropTypes.func.isRequired,
  /**
   * Menu Items/Menu Groups/Menu Dividers to be displayed.
   */
  children: PropTypes.node.isRequired,
  /**
   * Index within the Menu Stack.
   */
  index: PropTypes.number.isRequired,
  /**
   * Bounding container for the menu, will use window if no value provided.
   */
  boundingRef: PropTypes.func,
  /**
   * Indicates if menu's height has been constrained by bounding container.
   */
  isHeightBounded: PropTypes.bool,
  /**
   * Indicates if menu's width has been constrained by bounding container.
   */
  isWidthBounded: PropTypes.bool,
  /**
   * Fixed height for content.
   */
  fixedHeight: PropTypes.number,
  /**
   * Fixed width for content.
   */
  fixedWidth: PropTypes.number,
  contentWidth: PropTypes.number,
  /**
   * Indicates if the content should be hidden.
   */
  isHidden: PropTypes.bool,
  /**
   * Ref callback function to be applied to content container.
   */
  refCallback: PropTypes.func,
};

const defaultProps = {
  children: [],
  title: '',
};

const childContextTypes = {
  isSelectableMenu: PropTypes.bool,
};

class MenuContent extends React.Component {
  constructor(props) {
    super(props);
    this.wrapOnClick = this.wrapOnClick.bind(this);
    this.wrapOnKeyDown = this.wrapOnKeyDown.bind(this);
    this.buildHeader = this.buildHeader.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.onKeyDownBackButton = this.onKeyDownBackButton.bind(this);

    this.state = {
      focusIndex: -1,
    };
  }

  getChildContext() {
    return { isSelectableMenu: this.isSelectable() };
  }

  onKeyDownBackButton(event) {
    if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.ENTER || event.nativeEvent.keyCode === MenuUtils.KEYCODES.SPACE) {
      event.preventDefault();
      this.props.onRequestBack();
    }
  }

  isSelectable() {
    let isSelectable = false;
    React.Children.forEach(this.props.children, (child) => {
      if (child.props.children || child.props.isSelectable) {
        isSelectable = true;
      }
    });

    return isSelectable;
  }

  wrapOnClick(item) {
    const onClick = item.props.onClick;
    return (event) => {
      event.preventDefault();
      if (this.state.focusIndex !== -1) {
        this.setState({ focusIndex: -1 });
      }
      this.props.onRequestNext(item);

      if (onClick) {
        onClick(event);
      }
    };
  }

  wrapOnKeyDown(item, index) {
    const onKeyDown = item.props.onKeyDown;
    return ((event) => {
      event.preventDefault();
      if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.ENTER || event.nativeEvent.keyCode === MenuUtils.KEYCODES.SPACE) {
        if (item.props.subMenuItems && item.props.subMenuItems.length > 0) {
          this.props.onRequestNext(item);
        }
      } else if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.RIGHT_ARROW) {
        if (item.props.subMenuItems && item.props.subMenuItems.length > 0) {
          this.props.onRequestNext(item);
        }
      } else if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.LEFT_ARROW) {
        this.props.onRequestBack();
      } else if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.UP_ARROW) {
        this.setState({ focusIndex: index - 1 });
      } else if (event.nativeEvent.keyCode === MenuUtils.KEYCODES.DOWN_ARROW) {
        this.setState({ focusIndex: index + 1 });
      }

      if (onKeyDown) {
        onKeyDown(event);
      }
    });
  }

  buildHeader(isFullScreen) {
    const closeIcon = <IconClose />;
    let closeButton = <div />;
    if (this.props.onRequestClose && isFullScreen) {
      closeButton = (
        <button className={cx(['header-button', 'close-button'])} onClick={this.props.onRequestClose}>
          {closeIcon}
        </button>
      );
    }

    const backIcon = <IconLeft />;
    const backButton = this.props.index > 0 ? (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        role="button"
        onClick={this.props.onRequestBack}
        onKeyDown={this.onKeyDownBackButton}
        tabIndex="0"
      >
        <Arrange
          align="center"
          fitStart={(
            <div className={cx(['header-button'])}>
              {backIcon}
            </div>
          )}
          fill={<h1 className={cx(['header-title'])}>{this.props.title}</h1>}
        />
      </div>
    ) : <div />;

    return (
      <Arrange
        className={cx(['header'])}
        fitEnd={closeButton}
        fill={backButton}
        align="center"
      />
    );
  }

  render() {
    let index = -1;
    const items = React.Children.map(this.props.children, (item) => {
      let onClick = item.props.onClick;
      let newItem = item;

      if (item.props.subMenuItems && item.props.subMenuItems.length > 0) {
        onClick = this.wrapOnClick(item);
      }

      // Check if child is an enabled Menu.Item
      if (item.props.text && !item.props.isDisabled) {
        index += 1;
        const onKeyDown = this.wrapOnKeyDown(item, index);
        const isActive = this.state.focusIndex === index;

        newItem = React.cloneElement(item, {
          onClick,
          onKeyDown,
          isActive,
        });
      // If the child has children then it is an item group, so iterate through it's children
      } else if (item.props.children) {
        const children = React.Children.map(item.props.children, (child) => {
          if (!child.props.isDisabled) {
            index += 1;
            return React.cloneElement(child, {
              onKeyDown: this.wrapOnKeyDown(child, index),
              isActive: index === this.state.focusIndex,
            });
          }
          return child;
        });
        newItem = React.cloneElement(item, {}, children);
      }

      return newItem;
    });
    const boundingFrame = this.props.boundingRef ? this.props.boundingRef() : undefined;
    const isFullScreen = MenuUtils.isFullScreen(
      this.props.isHeightBounded,
      this.props.isWidthBounded,
      boundingFrame,
      this.props.contentWidth,
    );
    const isSubMenu = this.props.index > 0;
    const contentClass = cx([
      'content',
      { submenu: isSubMenu },
      { 'hidden-page': this.props.isHidden },
      { fullscreen: isFullScreen },
    ]);

    let header;
    if (isFullScreen || isSubMenu) {
      header = this.buildHeader(isFullScreen);
    }
    const contentHeight = this.props.isHeightBounded ? '100%' : this.props.fixedHeight;
    const contentWidth = this.props.isWidthBounded ? undefined : this.props.fixedWidth;

    return (
      <div
        ref={this.props.refCallback}
        className={contentClass}
        style={{ height: contentHeight, width: contentWidth }}
      >
        <ContentContainer header={header} fill={this.props.isHeightBounded}>
          <List className={cx(['list'])}>
            {items}
          </List>
        </ContentContainer>
      </div>
    );
  }
}


MenuContent.propTypes = propTypes;
MenuContent.defaultProps = defaultProps;
MenuContent.childContextTypes = childContextTypes;

export default MenuContent;
