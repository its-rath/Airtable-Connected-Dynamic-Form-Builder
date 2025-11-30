/**
 * Evaluates whether a question should be shown based on the rules and current answers.
 * 
 * @param {Object} rules - The conditional rules object { logic: 'AND' | 'OR', conditions: [] }
 * @param {Object} answersSoFar - Key-value pair of questionKey and answer value
 * @returns {boolean} - True if the question should be shown, false otherwise
 */
export const shouldShowQuestion = (rules, answersSoFar) => {
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    const { logic, conditions } = rules;

    // Helper to evaluate a single condition
    const evaluateCondition = (condition) => {
        const { questionKey, operator, value } = condition;
        const answer = answersSoFar[questionKey];

        if (answer === undefined || answer === null) return false;

        switch (operator) {
            case 'equals':
                return answer == value; // Loose equality to handle string/number differences if needed
            case 'notEquals':
                return answer != value;
            case 'contains':
                return String(answer).toLowerCase().includes(String(value).toLowerCase());
            default:
                return false;
        }
    };

    const results = conditions.map(evaluateCondition);

    if (logic === 'OR') {
        return results.some(result => result === true);
    } else {
        // Default to AND
        return results.every(result => result === true);
    }
};
