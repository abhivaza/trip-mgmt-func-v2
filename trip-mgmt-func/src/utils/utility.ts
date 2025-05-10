export const getOneMonthFromNow = () => {
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleString("default", { month: "short" });
  const year = now.getFullYear();

  return `${day}-${month}-${year}`;
};
