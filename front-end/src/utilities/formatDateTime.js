export function formatDate(dateString, timeString) {
  const monthName = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  };

  const currentYear = new Date().getFullYear();

  let formattedDateTime = '';
  let month = dateString.slice(5,7);
  month = monthName[month] || month;
  let day = (dateString[8] === '0') ? dateString[9] : dateString.slice(8,10);
  let year = dateString.slice(0,4);
  formattedDateTime = `${month} ${day}`;
  if (parseInt(year) > parseInt(currentYear)) {
    formattedDateTime += `, ${year}`;
  }

  if (timeString) {
    let hour = parseInt(timeString.slice(0,2), 10);
    const minute = timeString.slice(3,5);
    const ampm = (hour >= 12) ? 'PM' : 'AM';
    hour = (hour % 12 === 0) ? 12 : hour % 12;
    formattedDateTime += `, ${hour}:${minute} ${ampm}`;
  }

  return formattedDateTime;
}