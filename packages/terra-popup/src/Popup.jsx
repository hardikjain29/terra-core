import React from 'react';
import PropTypes from 'prop-types';
import Hookshot from 'terra-hookshot';
import Portal from 'react-portal';
import PopupContent from './_PopupContent';
import PopupArrow from './_PopupArrow';
import PopupOverlay from './_PopupOverlay';
import PopupUtils from './_PopupUtils';
import PopupHeights from './_PopupHeights';
import PopupWidths from './_PopupWidths';
import './Popup.scss';

const propTypes = {
  /**
   * If the primary attachment in not available, how should the content be positioned.
   */
  attachmentBehavior: PropTypes.oneOf(Hookshot.attachmentBehaviors),
  /**
   * The children to be displayed as content within the popup.
   */
  children: PropTypes.node.isRequired,
  /**
   * Callback function indicating a close condition was met, should be combined with isOpen for state management.
   */
  onRequestClose: PropTypes.func.isRequired,
  /**
   * Target element for the popup to anchor to.
   */
  targetRef: PropTypes.func.isRequired,
  /**
   * Bounding container for the popup, will use window if no value provided.
   */
  boundingRef: PropTypes.func,
  /**
   * CSS classnames that are append to the arrow.
   */
  classNameArrow: PropTypes.string,
  /**
   * CSS classnames that are append to the popup content inner.
   */
  classNameContent: PropTypes.string,
  /**
   * CSS classnames that are append to the overlay.
   */
  classNameOverlay: PropTypes.string,
  /**
   * Attachment point for the popup, this will be mirrored to the target.
   */
  contentAttachment: PropTypes.oneOf(Hookshot.attachmentPositions),
  /**
   * A string representation of the height in px, limited to:
   * 40, 80, 120, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880
   */
  contentHeight: PropTypes.oneOf(Object.keys(PopupHeights)),
  /**
   * A string representation of the width in px, limited to:
   * 160, 240, 320, 640, 960, 1280, 1760
   */
  contentWidth: PropTypes.oneOf(Object.keys(PopupWidths)),
  /**
   * Should an arrow be placed at the attachment point.
   */
  isArrowDisplayed: PropTypes.bool,
  /**
   * Should the default behavior, that inserts a header when constraints are breached, be disabled.
   */
  isHeaderDisabled: PropTypes.bool,
  /**
   * Should the popup be presented as open.
   */
  isOpen: PropTypes.bool,
  /**
   * A callback function to let the containing component (e.g. modal) to regain focus.
   */
  releaseFocus: PropTypes.func,
  /**
   * A callback function to request focus from the containing component (e.g. modal).
   */
  requestFocus: PropTypes.func,
  /**
   * Attachment point for the target.
   */
  targetAttachment: PropTypes.oneOf(Hookshot.attachmentPositions),
};

const defaultProps = {
  attachmentBehavior: 'auto',
  boundingRef: null,
  classNameArrow: null,
  classNameContent: null,
  classNameOverlay: null,
  contentAttachment: 'top center',
  contentHeight: '80',
  contentWidth: '240',
  isArrowDisplayed: false,
  isHeaderDisabled: false,
  isOpen: false,
};

class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.handleOnPosition = this.handleOnPosition.bind(this);
    this.setArrowNode = this.setArrowNode.bind(this);
    this.validateContentNode = this.validateContentNode.bind(this);
    this.isContentSized = props.contentHeight !== 'dynamic' && props.contentWidth !== 'dynamic';
    this.contentHeight = PopupHeights[props.contentHeight];
    this.contentWidth = PopupWidths[props.contentWidth];
  }

  componentWillReceiveProps(newProps) {
    this.isContentSized = newProps.contentHeight !== 'dynamic' && newProps.contentWidth !== 'dynamic';
    this.contentHeight = PopupHeights[newProps.contentHeight];
    this.contentWidth = PopupWidths[newProps.contentWidth];
  }

  setArrowPosition(tBounds, cBounds, cAttachment, tAttachment, tOffset) {
    const position = PopupUtils.arrowPositionFromBounds(tBounds, cBounds, PopupArrow.Opts.arrowSize, PopupContent.Opts.cornerSize, cAttachment);
    if (!position) {
      this.arrowNode.removeAttribute(PopupArrow.Opts.positionAttr);
      return;
    }
    this.arrowNode.setAttribute(PopupArrow.Opts.positionAttr, position);

    if (position === 'top' || position === 'bottom') {
      this.arrowNode.style.left = PopupUtils.leftOffset(tBounds, cBounds, PopupArrow.Opts.arrowSize, PopupContent.Opts.cornerSize, tAttachment, tOffset);
      this.arrowNode.style.top = '';
    } else {
      this.arrowNode.style.left = '';
      this.arrowNode.style.top = PopupUtils.topOffset(tBounds, cBounds, PopupArrow.Opts.arrowSize, PopupContent.Opts.cornerSize, tAttachment, tOffset);
    }
  }

  setArrowNode(node) {
    this.arrowNode = node;
  }

  handleOnPosition(event, targetBounds, contentBounds, cAttachment, tAttachement, tOffset) {
    if (this.arrowNode) {
      this.setArrowPosition(targetBounds, contentBounds, cAttachment, tAttachement, tOffset);
    }
  }

  validateContentNode(node) {
    if (node) {
      const contentRect = Hookshot.Utils.getBounds(node);
      if (this.contentHeight !== contentRect.height || this.contentWidth !== contentRect.width) {
        this.contentHeight = contentRect.height;
        this.contentWidth = contentRect.width;
        this.forceUpdate();
      }
      this.isContentSized = true;
    }
  }

  createPopupContent(boundingFrame, showArrow) {
    const boundsProps = {
      contentHeight: PopupHeights[this.props.contentHeight] || PopupHeights['80'],
      contentWidth: PopupWidths[this.props.contentWidth] || PopupWidths['240'],
    };
    if (boundsProps.contentHeight <= 0 && this.contentHeight) {
      boundsProps.contentHeight = this.contentHeight;
    }
    if (boundsProps.contentWidth <= 0 && this.contentWidth) {
      boundsProps.contentWidth = this.contentWidth;
    }

    if (boundingFrame) {
      boundsProps.contentHeightMax = boundingFrame.clientHeight;
      boundsProps.contentWidthMax = boundingFrame.clientWidth;
    } else {
      boundsProps.contentHeightMax = window.innerHeight;
      boundsProps.contentWidthMax = window.innerWidth;
    }

    let arrow;
    if (showArrow) {
      arrow = <PopupArrow className={this.props.classNameArrow} refCallback={this.setArrowNode} />;
    }

    return (
      <PopupContent
        {...boundsProps}
        arrow={arrow}
        classNameInner={this.props.classNameContent}
        isHeaderDisabled={this.props.isHeaderDisabled}
        onRequestClose={this.props.onRequestClose}
        refCallback={this.validateContentNode}
        releaseFocus={this.props.releaseFocus}
        requestFocus={this.props.requestFocus}
        isHeightDynamic={this.props.contentHeight === 'dynamic'}
        isWidthDynamic={this.props.contentWidth === 'dynamic'}
      >
        {this.props.children}
      </PopupContent>
    );
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      attachmentBehavior,
      boundingRef,
      children,
      classNameArrow,
      classNameContent,
      classNameOverlay,
      contentAttachment,
      contentHeight,
      contentWidth,
      isArrowDisplayed,
      isHeaderDisabled,
      isOpen,
      onRequestClose,
      releaseFocus,
      requestFocus,
      targetRef,
      targetAttachment,
    } = this.props;
    /* eslint-enable no-unused-vars */
    if (!isOpen) {
      return null;
    }

    let tAttachment;
    const cAttachment = Hookshot.Utils.parseStringPair(contentAttachment);
    if (targetAttachment) {
      tAttachment = Hookshot.Utils.parseStringPair(targetAttachment);
    } else {
      tAttachment = Hookshot.Utils.mirrorAttachment(cAttachment);
    }

    let cOffset;
    const showArrow = isArrowDisplayed && contentAttachment !== 'middle center';
    if (showArrow) {
      cOffset = PopupUtils.getContentOffset(cAttachment, tAttachment, this.props.targetRef(), PopupArrow.Opts.arrowSize, PopupContent.Opts.cornerSize);
    }
    const hookshotContent = this.createPopupContent(boundingRef ? boundingRef() : undefined, showArrow);

    return (
      <div>
        <Portal isOpened={isOpen}>
          <PopupOverlay className={this.props.classNameOverlay} />
        </Portal>
        <Hookshot
          attachmentBehavior={attachmentBehavior}
          attachmentMargin={showArrow ? PopupArrow.Opts.arrowSize : 0}
          boundingRef={boundingRef}
          content={hookshotContent}
          contentAttachment={contentAttachment}
          contentOffset={cOffset}
          isEnabled={this.isContentSized}
          isOpen={isOpen}
          onPosition={this.handleOnPosition}
          targetRef={targetRef}
          targetAttachment={`${tAttachment.vertical} ${tAttachment.horizontal}`}
        />
      </div>
    );
  }
}

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;

export default Popup;
