import { ReportGenerator } from '../src/ReportGenerator.refactored.js';

// --- Dados de Teste ---
const adminUser = { name: 'Admin', role: 'ADMIN' };
const standardUser = { name: 'User', role: 'USER' };

const testItems = [
  { id: 1, name: 'Produto A', value: 300 },
  { id: 2, name: 'Produto B', value: 700 }, // SerÃ¡ filtrado para standardUser
  { id: 3, name: 'Produto C', value: 1200 }, // SerÃ¡ filtrado para user E prioritÃ¡rio para admin
];

// Mock DB (nÃ£o Ã© usado na lÃ³gica atual, mas estÃ¡ lÃ¡ para o construtor)
const mockDb = {};

describe('ReportGenerator (Rede de SeguranÃ§a)', () => {
  let generator;

  beforeEach(() => {
    generator = new ReportGenerator(mockDb);
  });

  // --- CenÃ¡rios de ADMIN ---
  describe('Admin User', () => {
    it('deve gerar um relatÃ³rio CSV completo para Admin', () => {
      const report = generator.generateReport(
        'CSV',
        adminUser,
        JSON.parse(JSON.stringify(testItems)),
      );

      // Valida o comportamento (saÃ­da), nÃ£o a implementaÃ§Ã£o
      expect(report).toContain('ID,NOME,VALOR,USUARIO');
      expect(report).toContain('1,Produto A,300,Admin');
      expect(report).toContain('2,Produto B,700,Admin');
      expect(report).toContain('3,Produto C,1200,Admin');
      expect(report).toContain('Total,,\n2200,,');
    });

    it('deve gerar um relatÃ³rio HTML completo para Admin (com prioridade)', () => {
      const report = generator.generateReport(
        'HTML',
        adminUser,
        JSON.parse(JSON.stringify(testItems)), 
      );

      expect(report).toContain('<h1>RelatÃ³rio</h1>');
      expect(report).toContain('<h2>UsuÃ¡rio: Admin</h2>');
      // Item PadrÃ£o
      expect(report).toContain('<tr><td>1</td><td>Produto A</td><td>300</td></tr>');
      // Item PrioritÃ¡rio (acima de 1000)
      expect(report).toContain(
        '<tr style="font-weight:bold;"><td>3</td><td>Produto C</td><td>1200</td></tr>',
      );
      expect(report).toContain('<h3>Total: 2200</h3>');
    });
  });

  // --- CenÃ¡rios de USER PadrÃ£o ---
  describe('Standard User', () => {
    it('deve gerar um relatÃ³rio CSV filtrado para User (apenas itens <= 500)', () => {
      const report = generator.generateReport(
        'CSV',
        standardUser,
        JSON.parse(JSON.stringify(testItems)),
      );

      expect(report).toContain('ID,NOME,VALOR,USUARIO');
      // DEVE conter o item de 300
      expect(report).toContain('1,Produto A,300,User');
      // NÃƒO DEVE conter os itens caros
      expect(report).not.toContain('2,Produto B,700,User');
      expect(report).not.toContain('3,Produto C,1200,User');
      // Total deve ser apenas 300
      expect(report).toContain('Total,,\n300,,');
    });

    it('deve gerar um relatÃ³rio HTML filtrado para User (apenas itens <= 500)', () => {
      const report = generator.generateReport(
        'HTML',
        standardUser,
        JSON.parse(JSON.stringify(testItems)),
      );

      expect(report).toContain('<h1>RelatÃ³rio</h1>');
      expect(report).toContain('<h2>UsuÃ¡rio: User</h2>');
      // DEVE conter o item de 300
      expect(report).toContain('<tr><td>1</td><td>Produto A</td><td>300</td></tr>');
      // NÃƒO DEVE conter os itens caros
      expect(report).not.toContain('<td>Produto B</td>');
      expect(report).not.toContain('<td>Produto C</td>');
      // Total deve ser apenas 300
      expect(report).toContain('<h3>Total: 300</h3>');
    });
  });

  // --- Caso de Borda ---
  it('deve lidar com array de itens vazio corretamente', () => {
    const reportCSV = generator.generateReport('CSV', adminUser, []);
    expect(reportCSV).toContain('Total,,\n0,,');

    const reportHTML = generator.generateReport('HTML', adminUser, []);
    expect(reportHTML).toContain('<h3>Total: 0</h3>');
  });
});
