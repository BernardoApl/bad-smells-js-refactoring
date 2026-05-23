const ADMIN_PRIORITY_LIMIT = 1000;
const USER_VISIBLE_LIMIT = 500;

const roleRules = {
  ADMIN: (item) => ({
    visible: true,
    priority: item.value > ADMIN_PRIORITY_LIMIT,
  }),
  USER: (item) => ({
    visible: item.value <= USER_VISIBLE_LIMIT,
    priority: false,
  }),
};

const reportFormatters = {
  CSV: {
    header: () => 'ID,NOME,VALOR,USUARIO\n',
    row: (item, user) => `${item.id},${item.name},${item.value},${user.name}\n`,
    footer: (total) => `\nTotal,,\n${total},,\n`,
  },
  HTML: {
    header: (user) =>
      '<html><body>\n' +
      '<h1>RelatÃ³rio</h1>\n' +
      `<h2>UsuÃ¡rio: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n',
    row: (item) => {
      const priorityAttribute = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${priorityAttribute}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    },
    footer: (total) => `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`,
  },
};

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = reportFormatters[reportType];
    const visibleItems = this.getVisibleItems(user, items);
    const total = this.calculateTotal(visibleItems);

    return [
      formatter.header(user),
      ...visibleItems.map((item) => formatter.row(item, user)),
      formatter.footer(total),
    ].join('').trim();
  }

  getVisibleItems(user, items) {
    const rule = roleRules[user.role] || this.hideItem;
    return items.map((item) => this.applyVisibilityRule(item, rule)).filter((item) => item.visible);
  }

  applyVisibilityRule(item, rule) {
    const visibility = rule(item);
    return { ...item, ...visibility };
  }

  hideItem(item) {
    return { ...item, visible: false, priority: false };
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + item.value, 0);
  }
}
