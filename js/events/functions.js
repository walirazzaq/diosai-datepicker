import { limitToRange } from '../lib/utils.js';
import { addMonths, addYears } from '../lib/date.js';
import { formatDate } from '../lib/date-format.js';
export function triggerDatepickerEvent(datepicker, type) {
    const detail = {
        date: datepicker.getDate(),
        viewDate: new Date(datepicker.picker.viewDate),
        viewId: datepicker.picker.currentView.id,
        datepicker,
    };
    datepicker.element.dispatchEvent(new CustomEvent(type, { detail }));
    type === 'changeDate' && handleInlinePicker(datepicker)
}

function handleInlinePicker(datepicker) {
    const { config, element } = datepicker;
    element.value = () => datepicker.dates
    if (!config.dispatchToContainer) {
        //lazy event would have old values in case of silent set
        element.emitChange = () => { }
        return
    }
    if (config.isRange) {
        inlineRangePickerEvents(datepicker)
    }
    else {
        inlineDatepickerEvents(datepicker)
    }
}
function inlineRangePickerEvents(datepicker) {
    const { config, element } = datepicker;
    let detail = datepicker.dates.map(dt => formatDate(dt, config.format, config.locale))
    if (detail.length == 2) {
        dispatchToContainer(element, detail)
    }
}
function inlineDatepickerEvents(datepicker) {
    const { config, element } = datepicker;
    let detail = datepicker.dates.map(dt => formatDate(dt, config.format, config.locale))
    detail = config.maxNumberOfDates == 1 ? detail[0] : detail;
    dispatchToContainer(element, detail)
}

function dispatchToContainer(element, detail) {
    element.emitChange = () => {
        element.dispatchEvent(
            new CustomEvent('change', {
                detail,
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        )
    }
    element.dispatchEvent(
        new CustomEvent('input', {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        })
    )
}
// direction: -1 (to previous), 1 (to next)
export function goToPrevOrNext(datepicker, direction) {
    const { minDate, maxDate } = datepicker.config;
    const { currentView, viewDate } = datepicker.picker;
    let newViewDate;
    switch (currentView.id) {
        case 0:
            newViewDate = addMonths(viewDate, direction);
            break;
        case 1:
            newViewDate = addYears(viewDate, direction);
            break;
        default:
            newViewDate = addYears(viewDate, direction * currentView.navStep);
    }
    newViewDate = limitToRange(newViewDate, minDate, maxDate);
    datepicker.picker.changeFocus(newViewDate).render();
}

export function switchView(datepicker) {
    const viewId = datepicker.picker.currentView.id;
    if (viewId === datepicker.config.maxView) {
        return;
    }
    datepicker.picker.changeView(viewId + 1).render();
}

export function unfocus(datepicker) {
    if (datepicker.config.updateOnBlur) {
        datepicker.update({ autohide: true });
    } else {
        datepicker.refresh('input');
        datepicker.hide();
    }
}
