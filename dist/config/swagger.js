import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Escola Van - API de Gestão de Transporte Escolar',
            version: '1.0.0',
            description: 'API RESTful para gerenciamento de transporte escolar, incluindo responsáveis, crianças, escolas, pagamentos e contratos.',
            contact: {
                name: 'Escola Van',
                email: 'contato@escolavai.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtido através do endpoint /auth/login'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Mensagem de erro'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@escolavai.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'admin123'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description: 'Token JWT'
                        },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                nome: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string', enum: ['master', 'admin', 'cliente'] }
                            }
                        }
                    }
                },
                Responsavel: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nome: { type: 'string' },
                        cpf: { type: 'string' },
                        rg: { type: 'string' },
                        telefone: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        endereco: { type: 'string' },
                        active: { type: 'boolean' },
                        admin_id: { type: 'integer' }
                    }
                },
                ResponsavelInput: {
                    type: 'object',
                    required: ['nome', 'cpf', 'telefone', 'email', 'senha'],
                    properties: {
                        nome: { type: 'string', example: 'João Silva' },
                        cpf: { type: 'string', example: '123.456.789-00' },
                        rg: { type: 'string', example: '12.345.678-9' },
                        telefone: { type: 'string', example: '(11) 98765-4321' },
                        email: { type: 'string', format: 'email', example: 'joao@email.com' },
                        endereco: { type: 'string', example: 'Rua ABC, 123' },
                        senha: { type: 'string', format: 'password' }
                    }
                },
                Crianca: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nome: { type: 'string' },
                        data_nascimento: { type: 'string', format: 'date' },
                        escola_id: { type: 'integer' },
                        responsavel_id: { type: 'integer' },
                        tipo_transporte: { type: 'string', enum: ['ida_volta', 'so_ida', 'so_volta'] },
                        valor_contrato_anual: { type: 'number' },
                        data_inicio_contrato: { type: 'string', format: 'date' },
                        admin_id: { type: 'integer' }
                    }
                },
                Escola: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nome: { type: 'string' },
                        endereco: { type: 'string' },
                        telefone: { type: 'string' },
                        admin_id: { type: 'integer' }
                    }
                },
                Pagamento: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        responsavel_id: { type: 'integer' },
                        crianca_id: { type: 'integer' },
                        valor: { type: 'number' },
                        data_pagamento: { type: 'string', format: 'date' },
                        status: { type: 'string', enum: ['Pendente', 'Pago', 'Vencido'] },
                        admin_id: { type: 'integer' },
                        crianca_nome: { type: 'string' }
                    }
                },
                AdminUser: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nome: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['master', 'admin', 'cliente'] },
                        active: { type: 'boolean' },
                        cpf_cnpj: { type: 'string' },
                        endereco: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/controllers/*.ts', './src/routes/*.ts', './src/docs/*.ts']
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
