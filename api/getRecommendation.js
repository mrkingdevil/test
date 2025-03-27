const yahooFinance = require('yahoo-finance2').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const ticker = 'AAPL';
    const marketDataRaw = await yahooFinance.historical(ticker, { period1: new Date(Date.now() - 86400000), interval: '1h' });

    const marketData = marketDataRaw.map((entry) => ({
      date: entry.date.toISOString().slice(0,16).replace('T',' '),
      open: entry.open,
      close: entry.close,
      high: entry.high,
      low: entry.low,
    }));

    const prompt = `Analiza brevemente estos datos y recomienda si comprar, vender o mantener: ${JSON.stringify(marketData)}`;
    const result = await model.generateContent(prompt);
    const recommendation = result.response.text();

    res.status(200).json({ recommendation, marketData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
