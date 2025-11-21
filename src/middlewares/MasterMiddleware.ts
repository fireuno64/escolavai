import { Request, Response, NextFunction } from 'express';

export const forbidMaster = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user && user.role === 'master') {
        return res.status(403).json({ error: 'Acesso negado. Usuários Master não podem acessar dados de negócio.' });
    }
    next();
};

export const requireMaster = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'master') {
        return res.status(403).json({ error: 'Acesso negado. Apenas usuários Master podem realizar esta ação.' });
    }
    next();
};
