module.exports = {
    apps: [
        {
            name: 'escolavai-backend',
            script: './dist/server.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_file: './logs/backend-combined.log',
            time: true
        },
        {
            name: 'escolavai-chatbot',
            script: 'python3',
            args: 'app.py',
            cwd: './chatbot',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                FLASK_ENV: 'production',
                PORT: 5000
            },
            error_file: './logs/chatbot-error.log',
            out_file: './logs/chatbot-out.log',
            log_file: './logs/chatbot-combined.log',
            time: true
        }
    ]
};
