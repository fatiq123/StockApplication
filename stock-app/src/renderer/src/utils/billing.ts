import dayjs from 'dayjs';

interface BillCalculationResult {
  totalAmount: number;
  details: string;
}

export const validatePotatoDate = (date: dayjs.Dayjs): boolean => {
  // Must be between January and October of current year
  const currentYear = dayjs().year();
  const month = date.month();
  
  return date.year() === currentYear && month >= 0 && month <= 9;
};

export const calculatePotatoBill = (
  quantity: number,
  rate: number,
  startDate: Date
): BillCalculationResult => {
  // For potatoes, rate is fixed for 10 months regardless of start date
  const totalAmount = quantity * rate; // rate is already the 10-month rate
  const start = dayjs(startDate);
  const startYear = start.year();
  const month = start.month();
  
  // Validate storage period
  if (month > 9) {
    throw new Error('Potato storage must start between January and October');
  }
  
  return {
    totalAmount,
    details: 
      'BILLING DETAILS:\n' +
      '----------------------------------------\n' +
      `Storage Start Date: ${start.format('DD MMM YYYY')}\n` +
      `Number of Sacks: ${quantity}\n` +
      `Rate per Sack: ${rate} PKR\n` +
      `Total Amount: ${totalAmount} PKR\n` +
      '----------------------------------------\n' +
      `Fixed Period: January ${startYear} to October ${startYear}\n\n` +
      'IMPORTANT NOTES:\n' +
      '• Full 10-month payment is required regardless of start date\n' +
      '• Storage period is fixed from January to October\n' +
      '• Early withdrawal does not affect the total payment'
  };
};

function getDaysInMonth(date: dayjs.Dayjs): number {
  return date.daysInMonth();
}

export const calculateAppleBill = (
  quantity: number,
  rate: number,
  startDate: Date,
  endDate: Date,
): BillCalculationResult => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let totalAmount = 0;
  const monthlyBreakdown: string[] = [];

  // Always charge full month for first month
  const firstMonthAmount = quantity * rate;
  totalAmount += firstMonthAmount;

  // Add billing summary header
  monthlyBreakdown.push('BILLING DETAILS:\n');
  monthlyBreakdown.push(`Storage Period: ${start.format('DD MMM YYYY')} to ${end.format('DD MMM YYYY')}`);
  monthlyBreakdown.push(`Number of Crates: ${quantity}`);
  monthlyBreakdown.push(`Base Rate: ${rate} PKR per crate per month\n`);
  monthlyBreakdown.push('MONTHLY BREAKDOWN:');
  monthlyBreakdown.push('----------------------------------------');

  monthlyBreakdown.push(`${start.format('MMMM YYYY')} (First Month):\n` +
    `• Full month charge applies (initial month policy)\n` +
    `• Amount: ${quantity} crates × ${rate} PKR = ${firstMonthAmount} PKR\n`);

  // Calculate for subsequent months
  let currentMonth = start.add(1, 'month').startOf('month');
  
  while (currentMonth.isSame(end, 'month') || currentMonth.isBefore(end)) {
    let monthlyRate = 0;
    let rateDescription = '';

    if (currentMonth.isSame(end, 'month')) {
      const dayOfMonth = end.date();
      const daysInMonth = getDaysInMonth(currentMonth);
      
      if (dayOfMonth <= 3) {
        monthlyRate = 0;
        rateDescription = 'Exempt (days 1-3)';
      } else if (dayOfMonth <= 18) {
        monthlyRate = rate * 0.5;
        rateDescription = `Half rate (days 4-18 of ${daysInMonth})`;
      } else {
        monthlyRate = rate;
        rateDescription = `Full rate (days 19-${daysInMonth})`;
      }

      const monthAmount = quantity * monthlyRate;
      totalAmount += monthAmount;

      monthlyBreakdown.push(
        `${currentMonth.format('MMMM YYYY')} (Final Month):\n` +
        `• ${rateDescription}\n` +
        `• Amount: ${monthlyRate > 0 ? `${quantity} crates × ${monthlyRate} PKR = ${monthAmount} PKR` : 'No charge (exempt period)'}\n`
      );
    } else {
      // For complete months between start and end dates
      const monthAmount = quantity * rate;
      totalAmount += monthAmount;
      monthlyBreakdown.push(
        `${currentMonth.format('MMMM YYYY')}:\n` +
        `• Full month charge\n` +
        `• Amount: ${quantity} crates × ${rate} PKR = ${monthAmount} PKR\n`
      );
    }

    currentMonth = currentMonth.add(1, 'month');
  }

  monthlyBreakdown.push('----------------------------------------');
  monthlyBreakdown.push(`TOTAL AMOUNT: ${totalAmount} PKR`);

  return {
    totalAmount,
    details: monthlyBreakdown.join('\n')
  };
};