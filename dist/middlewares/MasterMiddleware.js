export const forbidMaster = (req, res, next) => {
    const user = req.user;
    if (user && user.role === 'master') {
        return res.status(403).json({ error: 'Acesso negado. Usuários Master não podem acessar dados de negócio.' });
    }
    next();
};
export const requireMaster = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'master') {
        return res.status(403).json({ error: 'Acesso negado. Apenas usuários Master podem realizar esta ação.' });
    }
    next();
};
