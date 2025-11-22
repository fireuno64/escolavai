
import { ContractController } from './src/controllers/ContractController.js';
import { Request, Response } from 'express';
import connection from './src/db.js';

// Mock Request and Response
const req = {
    params: { responsavelId: '1' }, // Assuming ID 1 exists
    query: {},
    user: { id: 1 }
} as unknown as Request;

const res = {
    status: (code: number) => {
        console.log(`Status: ${code}`);
        return res;
    },
    json: (data: any) => {
        console.log('JSON:', data);
        return res;
    },
    setHeader: (name: string, value: string) => {
        console.log(`Header: ${name} = ${value}`);
    },
    headersSent: false,
    on: () => { },
    once: () => { },
    emit: () => { },
    write: () => { },
    end: () => {
        console.log('Response ended');
    }
} as unknown as Response;

// Mock pipe for PDF
(res as any).pipe = (stream: any) => {
    console.log('PDF piped to response');
    return stream;
};

async function test() {
    try {
        console.log('Listing responsaveis...');
        const [rows] = await connection.query('SELECT id, nome, admin_id FROM responsavel LIMIT 5');
        console.log('Responsaveis:', rows);

        if (Array.isArray(rows) && rows.length > 0) {
            const id = (rows[0] as any).id;
            console.log(`Testing PDF generation for ID ${id}...`);
            req.params.responsavelId = id.toString();

            const controller = new ContractController();
            await controller.generateContract(req, res);
        } else {
            console.log('No responsaveis found to test');
        }

        console.log('Test finished');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
}

test();
