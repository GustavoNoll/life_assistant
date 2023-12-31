function groupByKind(transactions) {
  return transactions.reduce((grouped = [], transaction) => {
    const { kind, value } = transaction;
    if (!grouped[kind]) {
      grouped[kind] = { total: 0 };
    }

    grouped[kind].total += value;

    return grouped;
  }, {});
}
function calculateSum(transactions) {
  return transactions.reduce((sum, transaction) => sum + transaction.value, 0);
}

module.exports = {
  groupByKind,
  calculateSum,
};