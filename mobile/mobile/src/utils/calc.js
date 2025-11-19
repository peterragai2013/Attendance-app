const UNPAID_BREAK_HOURS = 1;
const PAID_DAILY_HOURS = 8;
const LEAVE_RATE_PER_DAY = 0.25;
const MONTHLY_OVERTIME_CAP = 60;

function hoursBetween(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const diff = (e - s) / (1000 * 60 * 60);
  return isNaN(diff) || diff < 0 ? 0 : diff;
}

function computeDay(checkinIso, checkoutIso) {
  const totalOnSite = hoursBetween(checkinIso, checkoutIso);
  const paidHours = Math.max(0, totalOnSite - UNPAID_BREAK_HOURS);
  const dailyOvertime = Math.max(0, paidHours - PAID_DAILY_HOURS);
  return { totalOnSite, paidHours, dailyOvertime };
}

function computeLateMinutes(checkinIso, workStartIso) {
  if (!checkinIso) return 0;
  const diffMin = Math.round((new Date(checkinIso) - new Date(workStartIso)) / (1000 * 60));
  return diffMin > 0 ? diffMin : 0;
}

function applyMonthlyCap(alreadyCountedHours, todayOvertime) {
  const available = Math.max(0, MONTHLY_OVERTIME_CAP - alreadyCountedHours);
  const counted = Math.min(available, todayOvertime);
  const notCounted = Math.max(0, todayOvertime - counted);
  return { counted, notCounted, available };
}

function accruedLeaves(workedDays) {
  return workedDays * LEAVE_RATE_PER_DAY;
}

module.exports = {
  computeDay,
  computeLateMinutes,
  applyMonthlyCap,
  accruedLeaves,
  UNPAID_BREAK_HOURS,
  PAID_DAILY_HOURS,
  LEAVE_RATE_PER_DAY,
  MONTHLY_OVERTIME_CAP
};
