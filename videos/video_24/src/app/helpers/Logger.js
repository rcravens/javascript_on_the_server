import fs from 'fs';
import path from 'path';

class Logger {
    #log_dir;
    #level;
    #retention_days;
    #levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    }

    constructor(log_dir = './logs', level = 'info', retention_days = 7) {
        this.#log_dir = path.resolve(log_dir);
        this.#level = level;
        this.#retention_days = retention_days;


        // Ensure log directory exists if file logging is enabled
        if (!fs.existsSync(this.#log_dir)) {
            fs.mkdirSync(this.#log_dir, {recursive: true});
        }

        // Start nightly purge task (runs at midnight)
        this.#start_purge_task();
    }

    #get_current_log_file() {
        const date = new Date().toISOString().split('T')[0]; // e.g., '2025-10-22'
        return path.join(this.#log_dir, `app-${date}.log`);
    }

    #log(level, message, ...args) {
        if (this.#levels[level] < this.#levels[this.#level]) {
            return; // Skip if below minimum level
        }

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`;

        // Log to console
        console[level in console ? level : 'log'](logMessage.trim());

        // Log to file if enabled (synchronous to avoid race conditions)
        try {
            fs.appendFileSync(this.#get_current_log_file(), logMessage, 'utf8');
        } catch (err) {
            console.error(`Failed to write to log file: ${err.message}`);
        }
    }

    #purge_old_logs() {
        try {
            const files = fs.readdirSync(this.#log_dir).filter(file => file.startsWith('app-') && file.endsWith('.log'));
            const cutoff_date = new Date();
            cutoff_date.setDate(cutoff_date.getDate() - this.#retention_days);

            for (const file of files) {
                const match = file.match(/app-(\d{4}-\d{2}-\d{2})\.log/);
                if (match) {
                    const file_date = new Date(match[1]);
                    if (file_date < cutoff_date) {
                        const file_path = path.join(this.#log_dir, file);
                        fs.unlinkSync(file_path);
                        this.info(`Purged old log file: ${file}`);
                    }
                }
            }
        } catch (err) {
            this.error(`Failed to purge old logs: ${err.message}`);
        }
    }

    #start_purge_task() {
        const run_purge = () => {
            this.#purge_old_logs();

            // Schedule next run at midnight
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const ms_until_midnight = tomorrow - now;
            setTimeout(run_purge, ms_until_midnight);
        };

        // Initial run after a short delay to avoid immediate execution
        setTimeout(run_purge, 1000);
    }

    debug(message, ...args) {
        this.#log('debug', message, ...args);
    }

    info(message, ...args) {
        this.#log('info', message, ...args);
    }

    warn(message, ...args) {
        this.#log('warn', message, ...args);
    }

    error(message, ...args) {
        this.#log('error', message, ...args);
    }
}

// Export a singleton instance
export const logger = new Logger('./logs', 'info', 7);