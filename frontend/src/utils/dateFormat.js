import moment from 'moment'


export const dateFormat = (date) =>{
    if(!date) return ''
    // If date is a month name like 'January', return it as-is
    if (typeof date === 'string' && moment(date, 'MMMM', true).isValid()) {
        return date
    }
    return moment(date).isValid() ? moment(date).format('DD/MM/YYYY') : String(date)
}