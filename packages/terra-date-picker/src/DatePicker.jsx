import React from 'react';
import PropTypes from 'prop-types';
import ReactDatePicker from 'react-datepicker';
import 'terra-base/lib/baseStyles';
import ResponsiveElement from 'terra-responsive-element';
import DateInput from './DateInput';
import DateUtil from './DateUtil';
import styles from './DatePicker.scss';

const propTypes = {
  /**
   * An array of ISO 8601 string representation of the dates to disable in the picker.
   */
  excludeDates: PropTypes.arrayOf(PropTypes.string),
  /**
   * A function that gets called for each date in the picker to evaluate which date should be disabled.
   * A return value of true will be enabled and false will be disabled.
   */
  filterDate: PropTypes.func,
  /**
   * An array of ISO 8601 string representation of the dates to enable in the picker. All Other dates will be disabled.
   */
  includeDates: PropTypes.arrayOf(PropTypes.string),
  /**
   * Custom input attributes to apply to the date input. Use the name prop to set the name for the input.
   * Do not set the name in inputAttribute as it will be ignored.
   */
  inputAttributes: PropTypes.object,
  /**
   * An ISO 8601 string representation of the maximum date that can be selected.
   */
  maxDate: PropTypes.string,
  /**
   * An ISO 8601 string representation of the minimum date that can be selected.
   */
  minDate: PropTypes.string,
  /**
   * Name of the date input. The name should be unique.
   */
  name: PropTypes.string.isRequired,
  /**
   * A callback function to execute when a valid date is selected or entered.
   * The first parameter is the event. The second parameter is the changed date value.
   */
  onChange: PropTypes.func,
  /**
   * A callback function to execute when a change is made in the date input.
   * The first parameter is the event. The second parameter is the changed date value.
   */
  onChangeRaw: PropTypes.func,
  /**
   * A callback function to execute when clicking outside of the picker to dismiss it.
   */
  onClickOutside: PropTypes.func,
  /**
   * A callback function to execute when a date is selected from within the picker.
   */
  onSelect: PropTypes.func,
  /**
   * A callback function to let the containing component (e.g. modal) to regain focus.
   */
  releaseFocus: PropTypes.func,
  /**
   * A callback function to request focus from the containing component (e.g. modal).
   */
  requestFocus: PropTypes.func,
  /**
   * An ISO 8601 string representation of the initial value to show in the date input.
   * This prop name is derived from react-datepicker but is analogous to value in a form input field.
   */
  selectedDate: PropTypes.string,
};

const defaultProps = {
  excludeDates: undefined,
  filterDate: undefined,
  includeDates: undefined,
  inputAttributes: undefined,
  maxDate: undefined,
  minDate: undefined,
  name: undefined,
  onChange: undefined,
  onChangeRaw: undefined,
  onClickOutside: undefined,
  onSelect: undefined,
  releaseFocus: undefined,
  requestFocus: undefined,
  selectedDate: undefined,
};

const contextTypes = {
  /* eslint-disable consistent-return */
  intl: (context) => {
    if (context.intl === undefined) {
      return new Error('Please add locale prop to Base component to load translations');
    }
  },
};

class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDate: DateUtil.createSafeDate(props.selectedDate),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeRaw = this.handleChangeRaw.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleOnClickOutside = this.handleOnClickOutside.bind(this);
  }

  handleOnSelect(selectedDate, event) {
    // onSelect should only be invoked when selecting a date from the picker.
    // react-datepicker has an issue where onSelect is invoked both when selecting a date from the picker
    // as well as manually entering a valid date or clearing the date,
    // Until a fix is made, we need to return if the event type is 'change' indicating that onSelect was
    // invoked from a manual change. See https://github.com/Hacker0x01/react-datepicker/issues/990
    if (event.type === 'change' || !selectedDate || !selectedDate.isValid()) {
      return;
    }

    this.releaseFocus();

    if (this.props.onSelect) {
      this.props.onSelect(event, selectedDate.format());
    }
  }

  handleOnClickOutside(event) {
    this.releaseFocus();

    if (this.props.onClickOutside) {
      this.props.onClickOutside(event);
    }
  }

  releaseFocus() {
    // The picker will be dismissed and the focus will be released so that the containing component (e.g. modal) can regain focus.
    if (this.props.releaseFocus) {
      this.props.releaseFocus();
    }
  }

  handleChange(date, event) {
    this.setState({
      selectedDate: date,
    });

    if (this.props.onChange) {
      this.props.onChange(event, date && date.isValid() ? date.format() : '');
    }
  }

  handleChangeRaw(event) {
    if (this.props.onChangeRaw) {
      this.props.onChangeRaw(event, event.target.value);
    }
  }

  render() {
    const {
      inputAttributes,
      excludeDates,
      filterDate,
      includeDates,
      maxDate,
      minDate,
      name,
      onChange,
      onChangeRaw,
      onClickOutside,
      onSelect,
      requestFocus,
      releaseFocus,
      selectedDate,
      ...customProps
    } = this.props;

    const intl = this.context.intl;
    const todayString = intl.formatMessage({ id: 'Terra.datePicker.today' });
    const dateFormat = DateUtil.getFormatByLocale(intl.locale);
    const exludeMomentDates = DateUtil.filterInvalidDates(excludeDates);
    const includeMomentDates = DateUtil.filterInvalidDates(includeDates);
    const maxMomentDate = DateUtil.createSafeDate(maxDate);
    const minMomentDate = DateUtil.createSafeDate(minDate);

    const portalPicker =
      (<ReactDatePicker
        {...customProps}
        selected={this.state.selectedDate}
        onChange={this.handleChange}
        onChangeRaw={this.handleChangeRaw}
        onClickOutside={this.handleOnClickOutside}
        onSelect={this.handleOnSelect}
        customInput={<DateInput inputAttributes={inputAttributes} releaseFocus={releaseFocus} requestFocus={requestFocus} />}
        excludeDates={exludeMomentDates}
        filterDate={filterDate}
        includeDates={includeMomentDates}
        maxDate={maxMomentDate}
        minDate={minMomentDate}
        todayButton={todayString}
        withPortal
        dateFormatCalendar=" "
        dateFormat={dateFormat}
        fixedHeight
        locale={intl.locale}
        placeholderText={dateFormat}
        dropdownMode={'select'}
        showMonthDropdown
        showYearDropdown
        name={name}
      />);

    const popupPicker =
      (<ReactDatePicker
        {...customProps}
        selected={this.state.selectedDate}
        onChange={this.handleChange}
        onChangeRaw={this.handleChangeRaw}
        onClickOutside={this.handleOnClickOutside}
        onSelect={this.handleOnSelect}
        customInput={<DateInput inputAttributes={inputAttributes} releaseFocus={releaseFocus} requestFocus={requestFocus} />}
        excludeDates={exludeMomentDates}
        filterDate={filterDate}
        includeDates={includeMomentDates}
        maxDate={maxMomentDate}
        minDate={minMomentDate}
        todayButton={todayString}
        dateFormatCalendar=" "
        dateFormat={dateFormat}
        fixedHeight
        locale={intl.locale}
        placeholderText={dateFormat}
        popoverAttachment="top center"
        popoverTargetAttachment="bottom center"
        dropdownMode={'select'}
        showMonthDropdown
        showYearDropdown
        tetherConstraints={[{ to: 'window', attachment: 'together', pin: true }]}
        name={name}
      />);

    return (
      <ResponsiveElement
        className={styles['date-picker']}
        responsiveTo="window"
        defaultElement={portalPicker}
        small={popupPicker}
      />
    );
  }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;
DatePicker.contextTypes = contextTypes;

export default DatePicker;
