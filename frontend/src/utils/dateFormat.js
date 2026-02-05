import moment from 'moment'


export const dateFormat = (date) =>{
    if(!date) return ''
    // If date is a month name like 'January', return it as-is
    if (typeof date === 'string' && moment(date, 'MMMM', true).isValid()) {
        return date
    }
    // Parse as UTC and display in UTC (don't convert to local timezone)
    // This ensures the date matches what was stored
    return moment.utc(date).isValid() ? moment.utc(date).format('M/D/YYYY') : String(date)
}