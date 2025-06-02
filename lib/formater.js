function renderTemplate(templateString, data) {
    return templateString.replace(/\/\*\[\|\s*(\w+)\s*\|]\*\/\s*0/g, function (_, key) {
        if (!data || data[key] === undefined) {
            return key;
        }
        if (typeof data[key] === "object") {
            return JSON.stringify(data[key]);
        }
        return data[key];
    });
}
exports.renderTemplate = renderTemplate;
