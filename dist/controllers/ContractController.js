import PDFDocument from 'pdfkit';
import { ResponsavelService } from '../services/ResponsavelService.js';
import connection from '../db.js';
const responsavelService = new ResponsavelService();
// Helper function to convert number to words in Portuguese
function numeroParaExtenso(valor) {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    if (valor === 0)
        return 'zero';
    if (valor === 100)
        return 'cem';
    let extenso = '';
    const parteInteira = Math.floor(valor);
    // Milhares
    const milhar = Math.floor(parteInteira / 1000);
    const centena = Math.floor((parteInteira % 1000) / 100);
    const dezena = Math.floor((parteInteira % 100) / 10);
    const unidade = parteInteira % 10;
    if (milhar > 0) {
        if (milhar === 1) {
            extenso += 'mil';
        }
        else {
            extenso += numeroParaExtenso(milhar) + ' mil';
        }
        if (centena > 0 || dezena > 0 || unidade > 0)
            extenso += ' ';
    }
    if (centena > 0) {
        extenso += centenas[centena];
        if (dezena > 0 || unidade > 0)
            extenso += ' e ';
    }
    if (dezena === 1) {
        extenso += especiais[unidade];
    }
    else {
        if (dezena > 0) {
            extenso += dezenas[dezena];
            if (unidade > 0)
                extenso += ' e ';
        }
        if (unidade > 0) {
            extenso += unidades[unidade];
        }
    }
    return extenso.trim();
}
export class ContractController {
    async generateContract(req, res) {
        try {
            const responsavelId = parseInt(req.params.responsavelId);
            const childId = req.query.childId ? parseInt(req.query.childId) : null;
            const adminId = req.user?.id || 1;
            // 1. Fetch Admin Data (CONTRATADO)
            const [adminData] = await connection.execute('SELECT nome, cpf_cnpj, endereco FROM admin WHERE id = ?', [adminId]);
            if (adminData.length === 0) {
                return res.status(404).json({ error: 'Dados do administrador não encontrados.' });
            }
            const admin = adminData[0];
            const adminNome = admin.nome || 'ANDERSON DE ALMEIDA SHIOTOKO';
            const adminCpfCnpj = admin.cpf_cnpj || '256.831.028-63';
            const adminEndereco = admin.endereco || 'Av. Laurita Ortega Mari, 1470 - Pq. Pinheiros';
            // 2. Fetch Responsavel Data
            const responsavel = await responsavelService.getResponsavelById(responsavelId, adminId);
            if (!responsavel) {
                return res.status(404).json({ error: 'Responsável não encontrado.' });
            }
            // 3. Fetch Child Data
            let query = 'SELECT * FROM crianca WHERE responsavel_id = ?';
            const params = [responsavelId];
            if (childId) {
                query += ' AND id = ?';
                params.push(childId);
            }
            const [children] = await connection.execute(query, params);
            if (children.length === 0) {
                return res.status(404).json({ error: 'Criança não encontrada ou não pertence a este responsável.' });
            }
            const child = children[0];
            const valorAnual = parseFloat(child.valorContratoAnual || child.valor_contrato_anual || '0');
            const valorMensal = valorAnual / 12;
            const valorAnualExtenso = numeroParaExtenso(valorAnual);
            // Calculate dates
            const dataInicioStr = child.dataInicioContrato || child.data_inicio_contrato;
            const dataInicio = dataInicioStr
                ? new Date(dataInicioStr)
                : new Date();
            const dataTermino = new Date(dataInicio);
            dataTermino.setFullYear(dataTermino.getFullYear() + 1);
            // Format dates
            const dataInicioFormatada = dataInicio.toLocaleDateString('pt-BR');
            const dataTerminoFormatada = dataTermino.toLocaleDateString('pt-BR');
            const hoje = new Date().toLocaleDateString('pt-BR');
            // 4. Create PDF with optimized margins
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            // Set response headers
            const currentYear = new Date().getFullYear();
            const childNameForFile = child.nome.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=contrato_${childNameForFile}_${currentYear}.pdf`);
            doc.pipe(res);
            // --- PDF Content ---
            // Header (reduced spacing)
            doc.fontSize(9).font('Helvetica-Bold').text('FENATRESC', { align: 'left' });
            doc.fontSize(7).font('Helvetica').text('FEDERAÇÃO NACIONAL DE TRANSPORTE DE ESCOLARES', { align: 'left' });
            doc.moveDown(0.3);
            doc.fontSize(9).text(`Data Início: ${dataInicioFormatada}`, { align: 'right' });
            doc.moveDown(1);
            // Title (reduced font and spacing)
            doc.fontSize(10).font('Helvetica-Bold')
                .text('CONTRATO PARTICULAR DE PRESTAÇÃO DE SERVIÇO DE TRANSPORTE ESCOLAR', { align: 'center' });
            doc.moveDown(1);
            // Parties (using admin data and reduced font)
            doc.fontSize(9).font('Helvetica')
                .text('Pelo presente CONTRATO PARTICULAR DE PRESTAÇÃO DE SERVIÇO DE TRANSPORTE ESCOLAR, de um lado ', { continued: false });
            // Format address
            let responsavelEndereco = responsavel.endereco || '';
            if (responsavel.numero)
                responsavelEndereco += `, ${responsavel.numero}`;
            if (responsavel.complemento)
                responsavelEndereco += ` - ${responsavel.complemento}`;
            if (responsavel.cep)
                responsavelEndereco += ` - CEP: ${responsavel.cep}`;
            doc.font('Helvetica-Bold').text(adminNome.toUpperCase(), { continued: true });
            doc.font('Helvetica').text(`, com o endereço à ${adminEndereco}, C.G.C/C.P.F. Nº ${adminCpfCnpj}, doravante denominado `, { continued: true });
            doc.font('Helvetica-Bold').text('CONTRATADO', { continued: true });
            doc.font('Helvetica').text(', e de outro lado ', { continued: true });
            doc.font('Helvetica-Bold').text(responsavel.nome.toUpperCase(), { continued: true });
            doc.font('Helvetica').text(` RG. ${responsavel.rg || 'N/A'} C.P.F. ${responsavel.cpf} residente à ${responsavelEndereco} Cidade SÃO PAULO Estado S.P doravante denominado `, { continued: true });
            doc.font('Helvetica-Bold').text('CONTRATANTE', { continued: true });
            doc.font('Helvetica').text(', tem entre si justo e contratado na melhor forma de direito as cláusulas seguintes:');
            doc.moveDown(0.8);
            // Cláusulas
            // Check for both camelCase and snake_case to be safe
            const tipoTransporte = child.tipoTransporte || child.tipo_transporte || 'ida_volta';
            let transporteTexto = '';
            if (tipoTransporte === 'ida_volta') {
                transporteTexto = '(X) sua residência à escola e vice versa ( ) só ida para escola ( ) só retorno para casa';
            }
            else if (tipoTransporte === 'so_ida') {
                transporteTexto = '( ) sua residência à escola e vice versa (X) só ida para escola ( ) só retorno para casa';
            }
            else if (tipoTransporte === 'so_volta') {
                transporteTexto = '( ) sua residência à escola e vice versa ( ) só ida para escola (X) só retorno para casa';
            }
            doc.fontSize(9).font('Helvetica-Bold').text('CLÁUSULA 1ª - ', { continued: true });
            doc.font('Helvetica').text(`O Contratado compromete-se a fazer o transporte escolar do aluno (a) ${child.nome} de ${transporteTexto}; em período normal de aulas, em conformidade com cadastro anexo.`);
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 2ª - ', { continued: true });
            doc.font('Helvetica').text(`O valor total deste contrato é de R$ ${valorAnual.toFixed(2)} (${valorAnualExtenso} REAIS), ou seja, 12 X R$ ${valorMensal.toFixed(2)}. Os pagamentos das parcelas deverão ser efetuados do 1º ao 5º dia útil de cada mês.`);
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 3ª - ', { continued: true });
            doc.font('Helvetica').text('O valor total da cláusula 2ª, poderá ser pago à vista com 5% (cinco por cento) de desconto, ou parcelado em 12 (doze) vezes sem desconto.');
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 4ª - ', { continued: true });
            doc.font('Helvetica').text(`Este contrato de transporte escolar tem início em ${dataInicioFormatada} e término em ${dataTerminoFormatada}.`);
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 5ª - ', { continued: true });
            doc.font('Helvetica').text('O aluno deverá estar pronto na porta de sua residência, para que não haja atraso no horário estabelecido pelo colégio.');
            doc.fontSize(8).text('Parágrafo primeiro - Na impossibilidade do aluno ficar na porta de sua residência, deverá aguardar o transporte em local apropriado, seguro e mais próximo de sua residência.');
            doc.text('Parágrafo segundo – Em hipótese alguma poderá o transportador esperar o aluno.');
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold').text('CLÁUSULA 6ª - ', { continued: true });
            doc.font('Helvetica').text('O contratado é responsável pela integridade física e moral do aluno transportado, durante o tempo que ele estiver em seu veículo.');
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 7ª - ', { continued: true });
            doc.font('Helvetica').text('As faltas ou licença do aluno, bem como paralizações em geral não eximem o contratante dos pagamentos ora contrato.');
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 8ª - ', { continued: true });
            doc.font('Helvetica').text('Em caso de indisciplina do aluno transportado será dado ciência ao contratante e ao responsável do colégio que deverão tomar medidas necessárias.');
            doc.fontSize(8).text('Parágrafo único - não será permitido que o aluno use palavras de baixo calão, agressões a outro aluno ou atitudes imorais, que poderá ser repreendida de maneira educada e verbal pelo contratado, notificando o responsável de imediato.');
            doc.text('a) Caso não haja solução na indisciplina, poderá o contratado rescindir o contrato sem pagamento de qualquer multa.');
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold').text('CLÁUSULA 9ª - ', { continued: true });
            doc.font('Helvetica').text('Na hipótese de mudança de endereço comunicar ao contratado, por escrito, e com prazo de 72 (setenta e duas) horas de antecedência.');
            doc.fontSize(8).text('a) O cancelamento neste caso não implicará multa contratual para nenhuma das partes.');
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold').text('CLÁUSULA 10ª - ', { continued: true });
            doc.font('Helvetica').text('Quem der causa ao rompimento deste contrato, que não seja nas condições aqui permitidas, pagará uma multa no valor de até 30% (trinta per cento) considerado proporcional ao período término do mesmo, sendo que o mesmo não poderá ser cancelado nos meses de Novembro, Dezembro e Janeiro.');
            doc.fontSize(8).text('Parágrafo primeiro – O valor da parcela poderá ser reajustado conforme o aumento dos combustíveis e seus derivados.');
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold').text('CLÁUSULA 11ª - ', { continued: true });
            doc.font('Helvetica').text('Fica eleito o foro da Comarca de São Paulo, capital, com prevalência sobre qualquer outra, por mais privilegiada que seja, para dirimir todas as dúvidas que possam advir do presente contrato. E por estarem assim justas e contratados de pleno acordo com todas as cláusulas e condições estipuladas, assinam o presente instrumento particular em 2 (duas) vias de igual teor e forma.');
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('CLÁUSULA 12ª - ', { continued: true });
            doc.font('Helvetica').text('Não fazemos transportes nos meses de férias pelos motivos de reparos e férias, dois dias durante o decorrer do ano com aviso prévio para vistorias semestrais e feriados prolongados.');
            doc.fontSize(8).text('a) Nos dias de Excursões / Passeios o transporte só será realizado em horário normal de aula.');
            doc.moveDown(1.5);
            // Date and signatures (reduced spacing)
            const [dia, mes, ano] = hoje.split('/');
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const mesExtenso = meses[parseInt(mes) - 1];
            doc.fontSize(9).text(`São Paulo, ${dia} de ${mesExtenso} de ${ano}.`, { align: 'center' });
            doc.moveDown(2.5);
            // Signature lines (reduced font)
            const lineY = doc.y;
            doc.moveTo(100, lineY).lineTo(250, lineY).stroke();
            doc.moveTo(350, lineY).lineTo(500, lineY).stroke();
            doc.moveDown(0.5);
            doc.fontSize(9);
            doc.text('Contratante', 100, doc.y, { width: 150, align: 'center' });
            doc.text('Contratado', 350, doc.y - 11, { width: 150, align: 'center' });
            doc.end();
        }
        catch (error) {
            console.error('Erro ao gerar contrato:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Erro ao gerar contrato: ' + error.message });
            }
        }
    }
}
