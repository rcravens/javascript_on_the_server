export default class Validator {
    static validate(rules, data) {
        const errors = {};

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];

            // Check required
            if (rule.required && (value === undefined || value === null || value === "")) {
                errors[field] = `${field} is required`;
                continue;
            }

            if (value == null) continue; // skip further checks if value is optional & missing

            // Type check
            if (rule.type && typeof value !== rule.type) {
                errors[field] = `${field} must be a ${rule.type}`;
                continue;
            }

            // Min length
            if (rule.min && typeof value === "string" && value.length < rule.min) {
                errors[field] = `${field} must be at least ${rule.min} characters`;
            }

            // Max length
            if (rule.max && typeof value === "string" && value.length > rule.max) {
                errors[field] = `${field} must be no more than ${rule.max} characters`;
            }

            // Regex pattern
            if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
                errors[field] = `${field} is not in a valid format`;
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
        };
    }
}