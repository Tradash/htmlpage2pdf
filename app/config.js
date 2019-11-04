const Env = {
  getInt: (varName, defaultValue) => {
    const rawValue = process.env[varName];
    if (!rawValue) return defaultValue;

    const value = parseInt(rawValue);

    return isNaN(value) ? defaultValue : value;
  }
};

module.exports = { httpPort: Env.getInt("HTML2PDFPORT", 8080) };
